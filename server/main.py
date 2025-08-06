from beam import asgi, Image
import os, io, base64, numpy as np, torch, requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image as PILImage

from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_ext(filename: str):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def download_model_if_needed():
    url = "https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_large.pt"
    model_path = "models/sam2.1_hiera_large.pt"
    os.makedirs("models", exist_ok=True)
    if not os.path.exists(model_path):
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(model_path, "wb") as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
        else:
            raise RuntimeError("Failed to download SAM2 model.")
    return model_path

def init_models():
    checkpoint = download_model_if_needed()
    cfg = "configs/sam2.1/sam2.1_hiera_l.yaml"
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = build_sam2(cfg, checkpoint, device=device)
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
    return {"mask_generator": mask_generator, "predictor": predictor}

@asgi(
    name="sam2-service",
    image=Image(python_packages=[
        "fastapi", "pillow", "numpy", "torch",
        "requests", "sam2", "python-multipart"
    ]),
    on_start=init_models,
    cpu=4.0,
    memory="8Gi",
    gpu="T4",
    concurrent_requests=2,
    authorized=False
)
def web_server(context):
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://house-painter-sam2.vercel.app"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

    models = context.on_start_value
    mask_generator = models["mask_generator"]
    predictor = models["predictor"]

    @app.get("/health-check")
    async def health_check():
        return {"success": "Ok"}

    @app.post("/api/upload")
    async def upload(image: UploadFile = File(...)):
        fname = image.filename
        if not allowed_ext(fname):
            raise HTTPException(400, "Invalid file type")
        path = os.path.join(UPLOAD_FOLDER, fname)
        with open(path, "wb") as f:
            f.write(await image.read())
        return {"message": "Uploaded", "filename": fname, "url": f"uploads/{fname}"}

    @app.post("/api/masks/generate")
    async def generate_masks(data: dict):
        fname = data.get("filename")
        if not fname:
            raise HTTPException(400, "Filename required")
        path = os.path.join(UPLOAD_FOLDER, fname)
        if not os.path.exists(path):
            raise HTTPException(404, "Not found")

        img = PILImage.open(path).convert("RGB")
        arr = np.array(img)
        masks = mask_generator.generate(arr)

        mask_list = []
        composite = np.zeros((*arr.shape[:2], 4), dtype=np.uint8)
        for i, mi in enumerate(masks):
            seg = mi["segmentation"]
            col = np.random.randint(0, 255, 3)
            cm = np.zeros((*arr.shape[:2], 4), dtype=np.uint8)
            cm[seg] = [*col, 200]
            composite[seg] = cm[seg]
            buf = io.BytesIO()
            PILImage.fromarray(cm).save(buf, format="PNG")
            mask_list.append({"id": i, "score": float(mi["predicted_iou"]),
                              "mask": base64.b64encode(buf.getvalue()).decode()})

        buf2 = io.BytesIO()
        PILImage.fromarray(composite).save(buf2, format="PNG")
        return {
            "masks": mask_list,
            "composite_mask": base64.b64encode(buf2.getvalue()).decode(),
            "image_size": arr.shape[:2]
        }

    @app.post("/api/masks/points")
    async def masks_by_points(data: dict):
        fname = data.get("filename")
        pts = data.get("points", [])
        if not fname or not pts:
            raise HTTPException(400, "Filename & points required")
        path = os.path.join(UPLOAD_FOLDER, fname)
        if not os.path.exists(path):
            raise HTTPException(404, "Not found")

        img = np.array(PILImage.open(path).convert("RGB"))
        input_points, labels = [], []
        for p in pts:
            x = int(p["x"] * img.shape[1])
            y = int(p["y"] * img.shape[0])
            input_points.append([x, y])
            labels.append(1 if p.get("is_positive", True) else 0)

        predictor.set_image(img)
        masks, _, _ = predictor.predict(
            point_coords=np.array(input_points),
            point_labels=np.array(labels),
            multimask_output=True,
        )
        combined = np.any(masks, axis=0)
        if not combined.any():
            return {"mask": "", "combined": True, "warning": "No valid mask found"}

        buf = io.BytesIO()
        PILImage.fromarray(combined.astype(np.uint8) * 255).save(buf, format="PNG")
        return {"mask": base64.b64encode(buf.getvalue()).decode(), "combined": True}

    @app.post("/api/image/apply-colors")
    async def apply_colors(data: dict):
        fname = data.get("filename")
        ops = data.get("operations", [])
        prev = data.get("previous_image")
        if prev:
            img = PILImage.open(io.BytesIO(base64.b64decode(prev))).convert("RGBA")
        else:
            path = os.path.join(UPLOAD_FOLDER, fname)
            if not os.path.exists(path):
                raise HTTPException(404, "Not found")
            img = PILImage.open(path).convert("RGBA")

        arr = np.array(img)
        for op in ops:
            mask_arr = np.array(PILImage.open(io.BytesIO(base64.b64decode(op["mask"]))).convert("L")) > 128
            color = op["color"]
            if color.startswith("rgba"):
                parts = [int(x.strip()) for x in color[5:-1].split(",")]
                r, g, b, a = parts[0], parts[1], parts[2], int(parts[3] * 255)
            else:
                h = color.lstrip("#")
                r, g, b = tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
                a = 255
            col = np.zeros_like(arr)
            col[mask_arr] = [r, g, b, a]
            alpha = col[:, :, 3:] / 255.0
            arr = (arr * (1 - alpha) + col * alpha).astype(np.uint8)

        buf = io.BytesIO()
        PILImage.fromarray(arr).save(buf, format="PNG")
        return {"colored_image": base64.b64encode(buf.getvalue()).decode()}

    return app
