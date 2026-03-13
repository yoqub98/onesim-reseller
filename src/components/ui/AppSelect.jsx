import { Box } from "@chakra-ui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { uiColors, uiControlSizes, uiRadii, uiShadows } from "../../design-system/tokens";

const statusStyles = {
  default: {
    borderColor: uiColors.borderStrong,
    hoverBorderColor: uiColors.borderStrong,
    focusBorderColor: uiColors.accent,
    focusShadow: uiShadows.focus
  },
  error: {
    borderColor: "#fca5a5",
    hoverBorderColor: uiColors.error,
    focusBorderColor: uiColors.error,
    focusShadow: "0 0 0 3px rgba(220, 38, 38, 0.22)"
  }
};

function AppSelect({ children, leftIcon, size = "md", status = "default", ...props }) {
  const controlSize = uiControlSizes[size] || uiControlSizes.md;
  const activeStatus = statusStyles[status] || statusStyles.default;

  return (
    <Box position="relative">
      {leftIcon ? (
        <Box
          position="absolute"
          left={2.5}
          top="50%"
          transform="translateY(-50%)"
          pointerEvents="none"
          color={uiColors.textSecondary}
          zIndex={1}
        >
          {leftIcon}
        </Box>
      ) : null}
      <Box
        as="select"
        appearance="none"
        w="100%"
        h={controlSize.h}
        pl={leftIcon ? 9 : 3}
        pe={9}
        borderWidth="1px"
        borderColor={activeStatus.borderColor}
        borderRadius={uiRadii.md}
        bg="white"
        color={uiColors.textPrimary}
        fontSize={controlSize.fontSize}
        _hover={{ borderColor: activeStatus.hoverBorderColor }}
        _focusVisible={{
          outline: "none",
          borderColor: activeStatus.focusBorderColor,
          boxShadow: activeStatus.focusShadow
        }}
        {...props}
      >
        {children}
      </Box>
      <Box
        position="absolute"
        right={2.5}
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        color={uiColors.textSecondary}
      >
        <ChevronDownIcon width={16} />
      </Box>
    </Box>
  );
}

export default AppSelect;
