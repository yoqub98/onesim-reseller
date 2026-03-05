import { Box, HStack, Text } from "@chakra-ui/react";
import { uiColors, uiRadii, uiShadows, uiTransitions } from "../../design-system/tokens";

const switchSizes = {
  sm: { trackW: "40px", trackH: "22px", knob: "18px", onLeft: "20px" },
  md: { trackW: "48px", trackH: "28px", knob: "24px", onLeft: "22px" }
};

function AppSwitch({ label, description, isChecked = false, isDisabled = false, size = "md", onChange }) {
  const dimensions = switchSizes[size] || switchSizes.md;

  const toggle = () => {
    if (!onChange || isDisabled) return;
    onChange({ target: { checked: !isChecked } });
  };

  return (
    <HStack justify="space-between" align="start" spacing={4} w="full">
      <Box flex="1">
        <Text fontSize="sm" fontWeight="600" color={isDisabled ? uiColors.textMuted : uiColors.textPrimary}>
          {label}
        </Text>
        {description ? (
          <Text mt={1} fontSize="xs" color={uiColors.textSecondary}>
            {description}
          </Text>
        ) : null}
      </Box>
      <Box
        as="button"
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={isDisabled}
        onClick={toggle}
        w={dimensions.trackW}
        h={dimensions.trackH}
        borderRadius={uiRadii.pill}
        bg={isChecked ? uiColors.accent : "#cbd5e1"}
        borderWidth="1px"
        borderColor={isChecked ? uiColors.accent : uiColors.borderStrong}
        position="relative"
        transition={uiTransitions.standard}
        cursor={isDisabled ? "not-allowed" : "pointer"}
        opacity={isDisabled ? 0.65 : 1}
        _focusVisible={{
          outline: "none",
          boxShadow: uiShadows.focus
        }}
      >
        <Box
          position="absolute"
          top="2px"
          left={isChecked ? dimensions.onLeft : "2px"}
          w={dimensions.knob}
          h={dimensions.knob}
          borderRadius={uiRadii.pill}
          bg="white"
          boxShadow="0 1px 2px rgba(0,0,0,0.2)"
          transition={uiTransitions.standard}
        />
      </Box>
    </HStack>
  );
}

export default AppSwitch;
