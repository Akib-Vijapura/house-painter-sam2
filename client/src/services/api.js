import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const uploadImage = (formData) =>
  api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const generateMasksService = (filename) =>
  api.post(`${import.meta.env.VITE_API_BASE_URL}/masks/generate`, { filename });

export const getMaskAtPointsService = (requestData) =>
  api.post(`${import.meta.env.VITE_API_BASE_URL}/masks/points`, requestData);

export const applyColorsService = (requestData) => 
  api.post(`${import.meta.env.VITE_API_BASE_URL}/image/apply-colors`, requestData);

export default api;
