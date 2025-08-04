 # 🏠 Indian House Painter — Interactive Wall Coloring Web App 🎨

This web application allows users to upload images of Indian-style houses, interactively select building walls using **Segment Anything Model 2 (SAM2)**, apply colors from a palette, and download the final customized image.

---

## 🚀 Live Demo

* **Frontend:** [frontend](https://house-painter-sam2.vercel.app/)
* **Backend API Docs (Postman):** [https://documenter.getpostman.com/view/47310445/2sB3BBoWxR](https://documenter.getpostman.com/view/47310445/2sB3BBoWxR)

---

## 🧠 Features

* ✅ Upload images of houses
* ✅ Generate segmentation masks using SAM2
* ✅ Click-to-select and shift-click to combine masks and control/command click to remove mask
* ✅ Apply custom colors to selected walls
* ✅ Toggle visibility of all masks
* ✅ See the color history and remove to color or undo last applied color
* ✅ Download final edited image
* ✅ Mobile and desktop responsive UI

---

## 🖼️ Demo Preview



https://github.com/user-attachments/assets/70704dd1-deb6-4126-956a-b72caf9638ed



---

## 🛠️ Tech Stack

### Frontend

* React.js (with Vite)
* MUI
* react-toastify for toast message
* Axios for API calls

### Backend

* Flask (for local)
* FastAPI (for production)
* SAM2 integration (via Meta’s official repo)

### DevOps & Deployment

* Vercel for frontend
* Beam Cloud for backend
* GitHub Actions for CI/CD

---

## 🧩 Project Structure

```
indian-house-painter/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── index.html
├── server/
│   ├── sam2/
│   ├── models/
│   ├── checkpoints/
│   ├── main.py
│   ├── beam.yaml
│   ├── Dockerfile.yaml
│   └── requirements.txt
├── .github/workflows/
│   └── beam-deploy.yml
├── README.md
└── LICENSE
```

---

## 📦 Installation

### Prerequisites

* Node.js ≥ 18
* Python ≥ 3.10
* GPU machine for SAM2 (or cpu if not)
* Git

---

## 🧑‍💻 Local Development

### 1. Clone the Repository

```bash
https://github.com/Akib-Vijapura/house-painter-sam2
cd house-painter-sam2
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 3. Backend Setup
Download ```sam2.1_hiera_large.pt``` with the help of ```download_ckpts.sh``` inside checkpoints and create folder name ```models``` inside server and copy ```sam2.1_hiera_large.pt``` inside that folder.

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

---

## 📡 API Endpoints (Sample)

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| GET    | `/health-check`        |  To check server is running properly |
| POST   | `/api/upload`              | To Upload image |
| POST   | `/api/uploads/<filename>`              | Get uploaded image |
| POST   | `/api/masks/generate`      | Generate SAM2 masks              |
| GET    | `/api/masks/points`       | Get mask for specific click      |
| POST   | `/api/image/apply-colors`         | Apply color to selected mask     |


---

## 🧠 How SAM2 Works Here

1. User uploads image → stored on server
2. Backend runs SAM2 to generate masks → returns metadata
3. User clicks a point → matched to nearest mask
4. User applies color → canvas updates only that region
5. Download option allows exporting modified canvas as PNG

---

## ⚙️ CI/CD

* GitHub Actions auto deploys to:

  * Vercel will handle automatic deployment when changes are detected in the ```client``` directory.
  * The backend is deployed to Beam. A GitHub Action is set up to automatically deploy when changes are detected in the ```server``` directory.

---

## 📥 Downloaded Output

* Final images are downloaded as `.png` with applied colors.
* Original resolution maintained.
* No watermark.

---

## 👨‍👩‍👧‍👦 Contributors

* [Akib Vijapura](https://github.com/Akib-Vijapura)

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

