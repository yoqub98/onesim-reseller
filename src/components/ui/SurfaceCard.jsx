import { Box } from "@chakra-ui/react";
import { uiColors, uiRadii, uiShadows } from "../../design-system/tokens";

function SurfaceCard({ children, ...props }) {
  return (
    <Box
      bg={uiColors.surface}
      borderWidth="1px"
      borderColor={uiColors.border}
      borderRadius={uiRadii.lg}
      boxShadow={uiShadows.soft}
      {...props}
    >
      {children}
    </Box>
  );
}

export default SurfaceCard;
