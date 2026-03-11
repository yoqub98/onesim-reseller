import { Box, HStack, Text } from "@chakra-ui/react";
import { uiColors, uiShadows, uiTransitions } from "../../design-system/tokens";

const switchSizes = {
  sm: { trackW: "36px", trackH: "20px", knob: "16px", offset: "2px" },
  md: { trackW: "44px", trackH: "24px", knob: "20px", offset: "2px" }
};

function AppSwitch({ label, description, isChecked = false, isDisabled = false, size = "sm", onChange }) {
  const dim = switchSizes[size] || switchSizes.sm;
  const knobTravel = `calc(${dim.trackW} - ${dim.knob} - ${dim.offset} * 2)`;

  const toggle = () => {
    if (!onChange || isDisabled) return;
    onChange({ target: { checked: !isChecked } });
  };

  return (
    <HStack justify="space-between" align="start" spacing={3} w="full">
      <Box flex="1">
        <Text fontSize="14px" fontWeight="600" color={isDisabled ? uiColors.textMuted : uiColors.textPrimary}>
          {label}
        </Text>
        {description ? (
          <Text mt={0.5} fontSize="12px" color={uiColors.textSecondary}>
            {description}
          </Text>
        ) : null}
      </Box>
      <Box
        as="button"
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label={label}
        disabled={isDisabled}
        onClick={toggle}
        w={dim.trackW}
        h={dim.trackH}
        minW={dim.trackW}
        borderRadius="999px"
        bg={isChecked ? uiColors.accent : "#d1d5db"}
        position="relative"
        transition={uiTransitions.standard}
        cursor={isDisabled ? "not-allowed" : "pointer"}
        opacity={isDisabled ? 0.5 : 1}
        flexShrink={0}
        _hover={!isDisabled ? { bg: isChecked ? uiColors.accentHover : "#b8bdc5" } : {}}
        _focusVisible={{
          outline: "none",
          boxShadow: uiShadows.focus
        }}
      >
        <Box
          position="absolute"
          top={dim.offset}
          left={dim.offset}
          transform={isChecked ? `translateX(${knobTravel})` : "translateX(0)"}
          w={dim.knob}
          h={dim.knob}
          borderRadius="50%"
          bg="white"
          boxShadow="0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)"
          transition={uiTransitions.standard}
        />
      </Box>
    </HStack>
  );
}

export default AppSwitch;
