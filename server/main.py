import os
import io
import base64
import numpy as np
import torch
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
from flask_cors import CORS

# SAM2 imports
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator

# Set environment variables
os.environ["HYDRA_FULL_ERROR"] = "1"
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

# Flask app setup
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load model
checkpoint = "models/sam2.1_hiera_large.pt"
model_cfg = "configs/sam2.1/sam2.1_hiera_l.yaml"

try:
    model = build_sam2(model_cfg, checkpoint, device="cuda" if torch.cuda.is_available() else "cpu")
    mask_generator = SAM2AutomaticMaskGenerator(
        model=model,
        points_per_side=32,
        pred_iou_thresh=0.56,
        stability_score_thresh=0.92,
        crop_n_layers=1,
        crop_n_points_downscale_factor=2,
        min_mask_region_area=100,
    )
    predictor = SAM2ImagePredictor(model)
    print("✅ SAM2 model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/health-check", methods=['GET'])
def health_check():
    return jsonify({"success": "Ok"}), 200


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        return jsonify({
            "message": "File uploaded successfully",
            "filename": filename,
            "url": f"/uploads/{filename}"
        }), 200

    return jsonify({"error": "File type not allowed"}), 400


@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/masks/generate', methods=['POST'])
def generate_masks():
    data = request.get_json()
    if not data or 'filename' not in data:
        return jsonify({"error": "Filename is required"}), 400

    filename = data['filename']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    try:
        image = Image.open(filepath)
        image = np.array(image.convert("RGB"))
        masks = mask_generator.generate(image)

        mask_data = []
        composite = np.zeros((image.shape[0], image.shape[1], 4), dtype=np.uint8)

        for i, mask_info in enumerate(masks):
            mask = mask_info['segmentation']
            color = np.random.randint(0, 255, 3)
            colored_mask = np.zeros((image.shape[0], image.shape[1], 4), dtype=np.uint8)
            colored_mask[mask] = [color[0], color[1], color[2], 128]
            composite[mask] = colored_mask[mask]

            mask_img = Image.fromarray(colored_mask)
            byte_arr = io.BytesIO()
            mask_img.save(byte_arr, format='PNG')
            byte_arr.seek(0)

            mask_data.append({
                "id": i,
                "score": float(mask_info['predicted_iou']),
                "mask": base64.b64encode(byte_arr.read()).decode('utf-8')
            })

        composite_img = Image.fromarray(composite)
        composite_byte_arr = io.BytesIO()
        composite_img.save(composite_byte_arr, format='PNG')
        composite_byte_arr.seek(0)

        return jsonify({
            "masks": mask_data,
            "composite_mask": base64.b64encode(composite_byte_arr.read()).decode('utf-8'),
            "image_size": image.shape[:2]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/masks/points', methods=['POST'])
def get_masks_at_points():
    data = request.get_json()
    filename = data.get('filename')
    points = data.get('points')

    try:
        image_path = os.path.join('uploads', filename)
        image = Image.open(image_path)
        image = np.array(image.convert("RGB"))

        input_points = []
        input_labels = []
        for point in points:
            x = int(point['x'] * image.shape[1])
            y = int(point['y'] * image.shape[0])
            input_points.append([x, y])
            input_labels.append(1 if point.get('is_positive', True) else 0)

        input_points = np.array(input_points)
        input_labels = np.array(input_labels)

        if len(input_points) == 0:
            return jsonify({"error": "No valid points provided"}), 400

        predictor.set_image(image)
        masks, scores, _ = predictor.predict(
            point_coords=input_points,
            point_labels=input_labels,
            multimask_output=True
        )

        combined_mask = np.zeros_like(masks[0], dtype=bool)
        for mask in masks:
            combined_mask = np.logical_or(combined_mask, mask)

        if not np.any(combined_mask):
            return jsonify({
                "mask": "",
                "combined": True,
                "warning": "No valid mask found for these points"
            }), 200

        mask_img = Image.fromarray(combined_mask.astype(np.uint8) * 255)
        byte_arr = io.BytesIO()
        mask_img.save(byte_arr, format='PNG')
        byte_arr.seek(0)
        mask_base64 = base64.b64encode(byte_arr.read()).decode('utf-8')

        return jsonify({
            "mask": mask_base64,
            "combined": True
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/image/apply-colors', methods=['POST'])
def apply_colors():
    data = request.get_json()
    filename = data.get('filename')
    color_operations = data.get('operations', [])
    previous_image = data.get('previous_image')

    try:
        if previous_image:
            image_data = base64.b64decode(previous_image)
            img = Image.open(io.BytesIO(image_data)).convert("RGBA")
        else:
            image_path = os.path.join('uploads', filename)
            img = Image.open(image_path).convert("RGBA")

        img_array = np.array(img)

        for operation in color_operations:
            mask_data = base64.b64decode(operation['mask'])
            mask_img = Image.open(io.BytesIO(mask_data)).convert('L')
            mask_array = np.array(mask_img) > 128

            color_str = operation['color']
            if color_str.startswith('rgba'):
                parts = color_str[5:-1].split(',')
                r = int(parts[0].strip())
                g = int(parts[1].strip())
                b = int(parts[2].strip())
                a = int(float(parts[3].strip()) * 255)
            else:
                hex_color = color_str.lstrip('#')
                r, g, b = tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))
                a = 255

            colored_region = np.zeros_like(img_array)
            colored_region[mask_array] = [r, g, b, a]

            alpha = colored_region[:, :, 3:] / 255.0
            img_array = (img_array * (1 - alpha) + colored_region * alpha).astype(np.uint8)

        result_img = Image.fromarray(img_array)
        byte_arr = io.BytesIO()
        result_img.save(byte_arr, format='PNG')

        return jsonify({
            "colored_image": base64.b64encode(byte_arr.getvalue()).decode('utf-8')
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# This is for local development only
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
