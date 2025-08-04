import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Stack,
  Tooltip,
  Fade,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReplayIcon from "@mui/icons-material/Replay";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ImageUpload from "../components/ImageUpload";
import useImageUpload from "../hooks/useImageUpload";

const HomePage = () => {
  const navigate = useNavigate();
  const { image, isUploading, handleImageUpload } = useImageUpload();
  const [showReupload, setShowReupload] = useState(false);

  const handleGenerateMasks = () => {
    if (!image) {
      toast.error("Please upload an image first");
      return;
    }
    navigate("/generate-masks", { state: { image } });
  };

  const handleReupload = () => setShowReupload(true);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at center, #e0f7fa 0%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 500,
        }}
      >
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            boxShadow: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            overflow: "visible",
          }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            color="primary.main"
            sx={{ mb: 1, textAlign: "center" }}
          >
            Building Mask Generator
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 1 }}
          >
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontWeight: 500, textAlign: "center" }}
            >
              Upload an image of an <b>Indian house</b> to generate segmentation
              masks.
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            align="center"
          >
            For best results, use bright, clear photos taken in daylight.
          </Typography>

          {!image || showReupload ? (
            <Fade in>
              <Box sx={{ width: "100%" }}>
                <ImageUpload
                  onImageUpload={(file) => {
                    handleImageUpload(file);
                    setShowReupload(false);
                  }}
                  isUploading={isUploading}
                />
              </Box>
            </Fade>
          ) : (
            <Fade in>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  mt: 1,
                }}
              >
                <CardMedia
                  component="img"
                  image={`${import.meta.env.VITE_API_BASE_URL}/${image.url}`}
                  alt="Uploaded building"
                  sx={{
                    width: "100%",
                    maxHeight: 300,
                    borderRadius: 3,
                    boxShadow: 2,
                    objectFit: "cover",
                  }}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2, width: "100%" }}
                >
                  <Tooltip title="Segment building areas" arrow>
                    <span>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<AutoFixHighIcon />}
                        onClick={handleGenerateMasks}
                        sx={{
                          px: 5,
                          textTransform: "none",
                          fontWeight: 600,
                          background:
                            "linear-gradient(90deg, #26c6da 0%, #00bcd4 100%)",
                          boxShadow: 3,
                        }}
                      >
                        Generate Masks
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="Upload a different image" arrow>
                    <span>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<ReplayIcon />}
                        onClick={handleReupload}
                        sx={{
                          px: 4,
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      >
                        Re-upload
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>
            </Fade>
          )}

          {(!image || showReupload) && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                textAlign: "center",
              }}
            >
              <UploadFileIcon fontSize="small" />
              Only JPG/PNG, max 5MB.
            </Typography>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default HomePage;
