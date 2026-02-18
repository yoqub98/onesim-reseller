import { Box, HStack, Text } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";

function AppSwitch({ label, description, isChecked = false, onChange }) {
  const toggle = () => {
    if (!onChange) return;
    onChange({ target: { checked: !isChecked } });
  };

  return (
    <HStack justify="space-between" align="start" spacing={4} w="full">
      <Box flex="1">
        <Text fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>
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
        onClick={toggle}
        w="44px"
        h="24px"
        borderRadius="999px"
        bg={isChecked ? uiColors.accent : "#cbd5e1"}
        position="relative"
        transition="all 0.2s ease"
      >
        <Box
          position="absolute"
          top="2px"
          left={isChecked ? "22px" : "2px"}
          w="20px"
          h="20px"
          borderRadius="999px"
          bg="white"
          boxShadow="0 1px 2px rgba(0,0,0,0.2)"
          transition="left 0.2s ease"
        />
      </Box>
    </HStack>
  );
}

export default AppSwitch;
