import { useState } from "react";
import { toast } from "react-toastify";
import { uploadImage } from "../services/api";

const useImageUpload = () => {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await uploadImage(formData);
      setImage(response.data);
      toast.success("Image uploaded successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to upload image";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    image,
    isUploading,
    error,
    handleImageUpload,
  };
};

export default useImageUpload;
