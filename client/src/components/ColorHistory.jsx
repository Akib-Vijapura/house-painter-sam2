import { Stack, Typography, IconButton, Box, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const ColorHistory = ({ history, onRemove }) => (
  <Stack spacing={1}>
    {history.map((item, index) => (
      <Paper key={index} elevation={2} sx={{ p: 1, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: 2,
              backgroundColor: item.color,
              border: "1.5px solid #d2dae3",
              boxShadow: 1,
            }}
          />
          <Typography variant="body2" sx={{ flexGrow: 1, ml: 1 }}>
            {item.color}
          </Typography>
          <IconButton
            size="small"
            edge="end"
            onClick={() => onRemove(index)}
            color="error"
            sx={{ ml: 1 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    ))}
  </Stack>
);

export default ColorHistory;
