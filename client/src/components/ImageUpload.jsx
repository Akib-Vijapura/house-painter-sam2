import { useCallback, useRef, useState } from "react";
import { Box, Button, Typography, Fade } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ImageUpload = ({ onImageUpload, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onImageUpload(e.dataTransfer.files[0]);
      }
    },
    [onImageUpload]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const openFileDialog = () => inputRef.current?.click();

  return (
    <Fade in>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        sx={{
          border: isDragging ? "2px solid #00bcd4" : "2px dashed #bdbdbd",
          borderRadius: 3,
          p: { xs: 2, md: 4 },
          background: isDragging
            ? "rgba(0, 188, 212, 0.08)"
            : "background.paper",
          outline: isDragging ? "2px solid #80deea" : "none",
          textAlign: "center",
          cursor: isUploading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          userSelect: "none",
          pointerEvents: isUploading ? "none" : "auto",
        }}
      >
        <input
          ref={inputRef}
          accept="image/*"
          style={{ display: "none" }}
          id="upload-image"
          type="file"
          disabled={isUploading}
          onChange={handleChange}
        />
        <CloudUploadIcon sx={{ color: "primary.main", fontSize: 48, mb: 1 }} />
        <Typography
          variant="h6"
          color={isDragging ? "primary.main" : "text.primary"}
          sx={{ fontWeight: 600 }}
        >
          Click or drag & drop an image here
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          JPG/PNG, max 5MB
        </Typography>
        <Button
          tabIndex={-1}
          variant="outlined"
          disabled={isUploading}
          sx={{ mt: 2, px: 4 }}
          onClick={(e) => {
            e.stopPropagation();
            openFileDialog();
          }}
        >
          {isUploading ? "Uploading..." : "Browse Files"}
        </Button>
      </Box>
    </Fade>
  );
};

export default ImageUpload;