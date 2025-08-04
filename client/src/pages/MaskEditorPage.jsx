import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Button,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Card,
  Paper,
  Divider,
} from "@mui/material";
import MaskPreview from "../components/MaskPreview";
import MaskControls from "../components/MaskControls";
import ColorPicker from "../components/ColorPicker";
import ColorHistory from "../components/ColorHistory";
import useMaskGeneration from "../hooks/useMaskGeneration";
import { DEFAULT_COLORS } from "../constants/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const MaskEditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { image, masks } = location.state || {};

  const {
    compositeMask,
    showAllMasks,
    selectedMasks,
    coloredImage,
    colorHistory,
    currentColor,
    setCurrentColor,
    toggleAllMasks,
    clearSelection,
    handleImageClick,
    handleApplyColor,
    handleDownload,
    handleUndo,
    removeColor,
    masksGenerated,
    imageRef,
    setCompositeMask,
    setMasksGenerated,
    setOriginalImage,
  } = useMaskGeneration();

  useEffect(() => {
    if (!image) {
      navigate("/");
      toast.error("No image found. Please upload an image first.");
      return;
    }
    if (masks) {
      setCompositeMask(masks.composite_mask);
      setOriginalImage(`${import.meta.env.VITE_API_BASE_URL}/${image.url}`);
      setMasksGenerated(true);
    }
  }, [
    image,
    navigate,
    masks,
    setCompositeMask,
    setOriginalImage,
    setMasksGenerated,
  ]);

  const [tabValue, setTabValue] = useState(0);

  if (!image) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at center, #f6fafc 0%, #ffffff 100%)",
        py: 4,
        px: { xs: 1, md: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1700px", mx: "auto" }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            Home
          </Button>
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary.main"
            sx={{ flexGrow: 1 }}
          >
            Edit Building Masks
          </Typography>
        </Stack>

        {/* Left control center */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: { xs: "100%", md: 400 },
              minWidth: 320,
              maxWidth: 440,
              alignSelf: "stretch",
              borderRadius: 4,
              p: { xs: 2, md: 3 },
              mb: { xs: 3, md: 0 },
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <MaskControls
              showAllMasks={showAllMasks}
              onToggleMasks={toggleAllMasks}
              onClearSelection={clearSelection}
              hasSelection={selectedMasks.length > 0}
              masksGenerated={masksGenerated}
            />

            <ColorPicker
              colors={DEFAULT_COLORS}
              currentColor={currentColor}
              onColorSelected={setCurrentColor}
              disabled={!masksGenerated}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleApplyColor}
                disabled={selectedMasks.length === 0 || !masksGenerated}
                fullWidth
                sx={{
                  fontWeight: 600,
                  background:
                    "linear-gradient(90deg, #26c6da 0%, #00bcd4 100%)",
                  boxShadow: 2,
                  borderRadius: 3,
                }}
              >
                Apply Color
              </Button>
              <Button
                variant="outlined"
                onClick={handleUndo}
                disabled={colorHistory.length === 0}
                fullWidth
                sx={{ fontWeight: 600, borderRadius: 3 }}
              >
                Undo
              </Button>
            </Stack>

            {!!colorHistory.length && (
              <Box
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  backgroundColor: "#f8fafb",
                  p: 2,
                  border: "1px solid #eef2f6",
                  flexGrow: 1,
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Color History
                </Typography>
                <ColorHistory history={colorHistory} onRemove={removeColor} />
              </Box>
            )}

            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "center" }}
              >
                Tip: Click image to select walls, Shift+Click to add, Ctrl+Click
                to remove from selection.
              </Typography>
            </Box>
          </Paper>

          {/* Image Panel */}
          <Card
            sx={{
              flex: 1,
              p: { xs: 1, md: 3 },
              borderRadius: 4,
              boxShadow: 3,
              background: "#fafdff",
              minWidth: 0,
              maxWidth: "100%",
              alignSelf: "stretch",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, val) => setTabValue(val)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="Original Image with Masks" />
              <Tab label="Colored Result" />
            </Tabs>
            {tabValue === 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Original Image with Masks
                </Typography>
                <MaskPreview
                  imageRef={imageRef}
                  imageUrl={`${import.meta.env.VITE_API_BASE_URL}/${image.url}`}
                  compositeMask={compositeMask}
                  showAllMasks={showAllMasks}
                  selectedMasks={selectedMasks}
                  coloredImage={null}
                  onImageClick={handleImageClick}
                />
              </>
            )}
            {tabValue === 1 && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Colored Result
                </Typography>
                {coloredImage ? (
                  <Box sx={{ position: "relative", minHeight: 400 }}>
                    <img
                      src={`data:image/png;base64,${coloredImage}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        borderRadius: 8,
                      }}
                      alt="Colored result"
                    />
                    <Tooltip title="Download colored image">
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleDownload}
                        sx={{
                          position: "absolute",
                          bottom: 24,
                          right: 24,
                          zIndex: 10,
                          px: 3,
                          fontWeight: 600,
                          borderRadius: 3,
                          boxShadow: 2,
                        }}
                      >
                        Download
                      </Button>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      minHeight: 400,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body2">
                      Color and download your result here
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default MaskEditorPage;
