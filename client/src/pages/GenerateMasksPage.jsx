import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box, Typography, Button, Card, CardMedia, Stack, LinearProgress, Fade } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoopIcon from '@mui/icons-material/Loop';
import useMaskGeneration from '../hooks/useMaskGeneration';
import LoadingModal from '../components/LoadingModal';

const GenerateMasksPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { image } = location.state || {};
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const {
    generateMasks,
    isGenerating,
    error
  } = useMaskGeneration();

  //not image found, redirect to home page
  useEffect(() => {
    if (!image) {
      toast.error('No image found. Please upload an image first.');
      navigate('/');
    }
  }, [image, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleGenerate = async () => {
    setProgress(0);
    setShowModal(true);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const masks = await generateMasks(image.filename, `${import.meta.env.VITE_API_BASE_URL}/${image.url}`);
      setProgress(100);
      setTimeout(() => {
        setShowModal(false);
        navigate('/edit-masks', { state: { image, masks } });
      }, 750);
    } catch (err) {
      console.error(err)
      clearInterval(interval);
      setShowModal(false);
      toast.error('Failed to generate masks');
    } finally {
      clearInterval(interval);
    }
  };

  const navigateHome = () => navigate('/');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #f5fafd 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 4 }
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 520,
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          boxShadow: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" width="100%" sx={{ mb: 5 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={navigateHome}
            sx={{
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Home
          </Button>
          <Box sx={{ flexGrow: 1 }} />
        </Stack>

        <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mt: -5, mb: 2 }}>
          Generate Building Masks
        </Typography>

        {image && (
          <Fade in>
            <CardMedia
              component="img"
              image={`${import.meta.env.VITE_API_BASE_URL}/${image.url}`}
              alt="Building to process"
              sx={{
                width: '100%',
                maxHeight: 300,
                borderRadius: 3,
                objectFit: 'cover',
                boxShadow: 2,
                mb: 3,
              }}
            />
          </Fade>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleGenerate}
          disabled={isGenerating}
          startIcon={<LoopIcon />}
          sx={{
            px: 4,
            fontWeight: 600,
            background: 'linear-gradient(90deg, #26c6da 0%, #00bcd4 100%)',
            boxShadow: 3,
            mt: 1,
            mb: 2
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Masks'}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0, textAlign: 'center' }}>
          This may take a few moments depending on image size and complexity.
        </Typography>

        <LoadingModal
          open={showModal}
          progress={progress}
          message="Generating masks..."
        />
      </Card>
    </Box>
  );
};

export default GenerateMasksPage;
