import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import ImageUpload from "../components/ImageUpload";
import useImageUpload from "../hooks/useImageUpload";
import useMaskGeneration from "../hooks/useMaskGeneration";
import ColorPicker from "../components/ColorPicker";

const UploadView = () => {
  const {
    image,
    isUploading,
    error: uploadError,
    handleImageUpload,
  } = useImageUpload();

  const {
    isGenerating,
    error: maskError,
    imageRef,
    compositeMask,
    showAllMasks,
    colorHistory,
    coloredImage,
    setCurrentColor,
    toggleAllMasks,
    generateMasks,
    selectedMasks,
    clearSelection,
    handleImageClick,
    handleApplyColor,
    handleDownload,
    handleUndo,
    setColoredImage,
  } = useMaskGeneration();

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Building Mask Generator
      </Typography>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
          {uploadError}
        </Alert>
      )}

      {maskError && (
        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
          {maskError}
        </Alert>
      )}

      {isUploading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : (
        <ImageUpload onImageUpload={handleImageUpload} />
      )}

      {image && (
        <Box sx={{ position: "relative" }}>
          <img
            ref={imageRef}
            src={`${import.meta.env.VITE_API_BASE_URL}/${image.url}`}
            onClick={handleImageClick}
            style={{
              width: "100%",
              cursor: "crosshair",
              border: "1px solid #ddd",
            }}
            alt="Building"
          />

          {showAllMasks && compositeMask && (
            <img
              src={`data:image/png;base64,${compositeMask}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                pointerEvents: "none",
                opacity: 0.7,
              }}
              alt="All masks"
            />
          )}

          {selectedMasks.map((maskData, index) => (
            <img
              key={index}
              src={`data:image/png;base64,${maskData.mask}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                pointerEvents: "none",
                opacity: 0.5,
                backgroundColor: "rgba(0,255,0,0.3)",
              }}
              alt="Selected mask"
            />
          ))}
        </Box>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={() =>
            generateMasks(
              image.filename,
              `${import.meta.env.VITE_API_BASE_URL}${image.url}`
            )
          }
          disabled={!image || isGenerating}
        >
          Generate Masks
        </Button>

        <Button
          variant="outlined"
          onClick={toggleAllMasks}
          disabled={!compositeMask}
        >
          {showAllMasks ? "Hide All Masks" : "Show All Masks"}
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={clearSelection}
          disabled={selectedMasks.length === 0}
        >
          Clear Selection
        </Button>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Click to select walls, Shift+Click to add to selection, Ctrl+Click to
          subtract
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <ColorPicker onColorSelected={setCurrentColor} />

        <Button
          variant="contained"
          onClick={handleApplyColor}
          disabled={selectedMasks.length === 0}
        >
          Apply Color
        </Button>

        <Button
          variant="outlined"
          onClick={handleUndo}
          disabled={colorHistory.length === 0}
        >
          Undo
        </Button>
      </Stack>

      {colorHistory.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Color History:</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {colorHistory.map((item, index) => (
              <Box
                key={index}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: item.color,
                  border: "1px solid #ddd",
                  cursor: "pointer",
                }}
                onClick={() => setColoredImage(item.image)}
              />
            ))}
          </Stack>
        </Box>
      )}

      {coloredImage && (
        <Box sx={{ mt: 4, border: "1px solid #ddd", position: "relative" }}>
          <img
            src={`data:image/png;base64,${coloredImage}`}
            style={{ width: "100%" }}
            alt="Colored Result"
          />

          <Button
            variant="contained"
            color="success"
            onClick={handleDownload}
            sx={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              zIndex: 10,
            }}
          >
            Download Image
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UploadView;
