import { Box } from "@mui/material";

const MaskPreview = ({
  imageRef,
  imageUrl,
  compositeMask,
  showAllMasks,
  selectedMasks,
  coloredImage,
  onImageClick,
}) => (
  <Box
    sx={{
      position: "relative",
      width: "100%",
      minHeight: "340px",
      borderRadius: 3,
      overflow: "hidden",
      boxShadow: 2,
      backgroundColor: "#f4f8fb",
    }}
  >
    {coloredImage ? (
      <img
        ref={imageRef}
        src={`data:image/png;base64,${coloredImage}`}
        onClick={onImageClick}
        style={{
          width: "100%",
          height: "auto",
          cursor: "crosshair",
          display: "block",
          borderRadius: 8,
        }}
        alt="Colored building"
      />
    ) : (
      <>
        <img
          ref={imageRef}
          src={imageUrl}
          onClick={onImageClick}
          style={{
            width: "100%",
            height: "auto",
            cursor: "crosshair",
            display: "block",
            borderRadius: 8,
          }}
          alt="Original building"
        />
        {showAllMasks && compositeMask && (
          <img
            src={`data:image/png;base64,${compositeMask}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "auto",
              pointerEvents: "none",
              opacity: 0.5,
              borderRadius: 8,
              mixBlendMode: "screen",
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
              height: "auto",
              pointerEvents: "none",
              opacity: 0.7,
              borderRadius: 8,
              mixBlendMode: "multiply",
            }}
            alt="Selected mask"
          />
        ))}
      </>
    )}
  </Box>
);

export default MaskPreview;
