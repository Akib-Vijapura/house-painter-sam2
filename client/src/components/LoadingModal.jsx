import {
  Box,
  Modal,
  Typography,
  LinearProgress,
  CircularProgress,
  Stack,
  Fade,
} from "@mui/material";

const LoadingModal = ({ open, progress = 0, message = "Loading..." }) => {
  return (
    <Modal open={open} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90vw", sm: 400 },
            bgcolor: "background.paper",
            boxShadow: 8,
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            outline: "none",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {message}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                width: "100%",
                height: 10,
                borderRadius: 5,
                background: (theme) => theme.palette.grey[200],
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  background:
                    "linear-gradient(90deg, #26c6da 0%, #00bcd4 100%)",
                },
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", fontWeight: 500 }}
            >
              {progress}% completed
            </Typography>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default LoadingModal;
