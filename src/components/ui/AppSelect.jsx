import { Box } from "@chakra-ui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { uiColors, uiRadii } from "../../design-system/tokens";

function AppSelect({ children, leftIcon, ...props }) {
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
        h="40px"
        pl={leftIcon ? 9 : 3}
        pe={9}
        borderWidth="1px"
        borderColor={uiColors.borderStrong}
        borderRadius={uiRadii.sm}
        bg="white"
        color={uiColors.textPrimary}
        fontSize="sm"
        _focusVisible={{ outline: "none", borderColor: uiColors.accent }}
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
