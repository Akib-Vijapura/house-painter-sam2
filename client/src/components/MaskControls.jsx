import {
  Stack,
  Button,
  Switch,
  FormControlLabel,
  Paper,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const MaskControls = ({
  showAllMasks,
  onToggleMasks,
  onClearSelection,
  hasSelection,
  masksGenerated,
}) => (
  <Paper elevation={1} sx={{ p: 2, borderRadius: 3 }}>
    <Stack spacing={3}>
      <FormControlLabel
        control={
          <Switch
            checked={showAllMasks}
            onChange={onToggleMasks}
            color="primary"
            disabled={!masksGenerated}
          />
        }
        label={
          <Stack direction="row" alignItems="center" spacing={1}>
            {showAllMasks ? (
              <VisibilityIcon fontSize="small" color="primary" />
            ) : (
              <VisibilityOffIcon fontSize="small" />
            )}
            <Typography>
              {showAllMasks ? "Masks Visible" : "Masks Hidden"}
            </Typography>
          </Stack>
        }
        labelPlacement="end"
        sx={{ ml: 0, justifyContent: "space-between" }}
      />
      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={onClearSelection}
        disabled={!hasSelection || !masksGenerated}
        fullWidth
        sx={{ fontWeight: 600, borderRadius: 3 }}
      >
        Clear Selection
      </Button>
    </Stack>
  </Paper>
);

export default MaskControls;
