import { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  generateMasksService,
  getMaskAtPointsService,
  applyColorsService,
} from "../services/api";

const useMaskGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [showAllMasks, setShowAllMasks] = useState(true);
  const [compositeMask, setCompositeMask] = useState(null);
  const [selectedMasks, setSelectedMasks] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [currentColor, setCurrentColor] = useState("#4A90E2");
  const [coloredImage, setColoredImage] = useState(null);
  const [colorHistory, setColorHistory] = useState([]);
  const [masksGenerated, setMasksGenerated] = useState(false);

  const imageRef = useRef(null);

  const generateMasks = useCallback(async (filename, imageUrl) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateMasksService(filename);

      setCompositeMask(response.data.composite_mask);
      setOriginalImage(imageUrl);
      setMasksGenerated(true);
      toast.success("Masks generated successfully");
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to generate masks";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const getMaskAtPoints = useCallback(
    async (points) => {
      if (!imageRef.current || !originalImage || points.length === 0) {
        console.error("Missing required elements");
        return null;
      }

      const rect = imageRef.current.getBoundingClientRect();

      try {
        const requestData = {
          filename: originalImage.split("/").pop(),
          points: points.map((p) => ({
            x: p.x / rect.width,
            y: p.y / rect.height,
            is_positive: p.isPositive !== false,
          })),
        };

        const response = await getMaskAtPointsService(requestData);

        if (!response.data.mask) {
          toast.warning("No mask found at this location");
          return null;
        }

        return response.data.mask;
      } catch (err) {
        console.error("API call failed:", err);
        const errorMsg = err.response?.data?.error || "Failed to get mask";
        toast.error(errorMsg);
        return null;
      }
    },
    [originalImage]
  );

  const toggleAllMasks = useCallback(() => {
    setShowAllMasks((prev) => !prev);
  }, []);

  const handleImageClick = useCallback(
    async (event) => {
      if (!imageRef.current || !masksGenerated) {
        return;
      }

      const rect = imageRef.current.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        isPositive: !event.ctrlKey && !event.metaKey,
      };

      try {
        // Shift key for adding/removing from selection
        if (event.shiftKey) {
          const newPoints = [...currentPoints, point];
          setCurrentPoints(newPoints);

          const combinedMask = await getMaskAtPoints(newPoints);
          if (combinedMask) {
            setSelectedMasks([
              {
                points: newPoints,
                mask: combinedMask,
              },
            ]);
            toast.info("Added to selection");
          }
        }
        // Regular click - new selection
        else {
          setCurrentPoints([point]);
          const mask = await getMaskAtPoints([point]);
          if (mask) {
            setSelectedMasks([
              {
                points: [point],
                mask: mask,
              },
            ]);
            toast.info("New selection created");
          }
        }
      } catch (error) {
        console.error("Error in handleImageClick:", error);
        toast.error("Failed to select mask");
      }
    },
    [currentPoints, getMaskAtPoints, masksGenerated]
  );

  const clearSelection = useCallback(() => {
    setSelectedMasks([]);
    setCurrentPoints([]);
  }, []);

  const applyColors = useCallback(
    async (color) => {
      if (!originalImage || selectedMasks.length === 0) return null;

      try {
        const operations = selectedMasks.map((mask) => ({
          mask: mask.mask,
          color: color,
        }));

        const requestData = {
          filename: originalImage.split("/").pop(),
          operations: operations,
          previous_image: coloredImage,
        };

        const response = await applyColorsService(requestData);

        toast.success("Color applied successfully");
        return response.data.colored_image;
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to apply color";
        toast.error(errorMsg);
        return null;
      }
    },
    [originalImage, selectedMasks, coloredImage]
  );

  const handleApplyColor = useCallback(async () => {
    const result = await applyColors(currentColor);
    if (result) {
      setColoredImage(result);
      setColorHistory((prev) => [
        ...prev,
        {
          masks: selectedMasks,
          color: currentColor,
          image: result,
        },
      ]);
      clearSelection();
    }
  }, [applyColors, currentColor, selectedMasks, clearSelection]);

  const handleDownload = useCallback(() => {
    if (!coloredImage) {
      toast.error("No image to download");
      return;
    }

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${coloredImage}`;
    link.download = "colored-building.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  }, [coloredImage]);

  const handleUndo = useCallback(() => {
    if (colorHistory.length > 0) {
      const newHistory = [...colorHistory];
      newHistory.pop();
      setColorHistory(newHistory);

      setColoredImage(
        newHistory.length > 0 ? newHistory[newHistory.length - 1].image : null
      );

      toast.info("Undo last color application");
    }
  }, [colorHistory]);

  const removeColor = useCallback(
    (index) => {
      setColorHistory((prev) => prev.filter((_, i) => i !== index));

      if (coloredImage === colorHistory[index].image) {
        setColoredImage(index > 0 ? colorHistory[index - 1].image : null);
      }

      toast.info("Color removed from history");
    },
    [coloredImage, colorHistory]
  );

  return {
    isGenerating,
    error,
    imageRef,
    compositeMask,
    showAllMasks,
    currentColor,
    setCurrentColor,
    coloredImage,
    colorHistory,
    selectedMasks,
    masksGenerated,
    generateMasks,
    toggleAllMasks,
    clearSelection,
    handleImageClick,
    handleApplyColor,
    handleDownload,
    handleUndo,
    removeColor,
    setCompositeMask,
    setMasksGenerated,
    setOriginalImage,
  };
};

export default useMaskGeneration;
