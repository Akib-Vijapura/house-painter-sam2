import { Box, Typography } from "@mui/material";
import { ChromePicker } from "react-color";

const ColorPicker = ({ colors, currentColor, onColorSelected, disabled }) => (
  <Box>
    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
      Select a color:
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
      {colors.map((color) => (
        <Box
          key={color}
          onClick={() => !disabled && onColorSelected(color)}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: color,
            borderRadius: 2,
            cursor: disabled ? "not-allowed" : "pointer",
            border:
              currentColor === color
                ? "2.5px solid #00bcd4"
                : "1px solid #e0e0e0",
            boxShadow: currentColor === color ? 2 : 0,
            transition: "transform 0.2s",
            "&:hover": !disabled ? { transform: "scale(1.12)" } : {},
            opacity: disabled ? 0.35 : 1,
          }}
        />
      ))}
    </Box>
    <Box
      sx={{
        pointerEvents: disabled ? "none" : "auto",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <ChromePicker
        color={currentColor}
        onChangeComplete={(color) => onColorSelected(color.hex)}
        disableAlpha
        styles={{
          default: {
            picker: { boxShadow: "none", width: "100%" },
          },
        }}
      />
    </Box>
  </Box>
);

export default ColorPicker;