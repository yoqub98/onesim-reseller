import { Box, HStack, Text } from "@chakra-ui/react";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";
import { uiColors, uiRadii, uiShadows, uiTransitions } from "../../design-system/tokens";

function AppCheckbox({
  label,
  description,
  isChecked = false,
  isIndeterminate = false,
  isDisabled = false,
  onChange,
  name,
  value
}) {
  const isActive = isChecked || isIndeterminate;

  return (
    <HStack
      as="label"
      spacing={3}
      align="start"
      cursor={isDisabled ? "not-allowed" : "pointer"}
      opacity={isDisabled ? 0.65 : 1}
      w="fit-content"
    >
      <Box position="relative" mt="1px">
        <Box
          as="input"
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          onChange={onChange}
          name={name}
          value={value}
          position="absolute"
          inset={0}
          opacity={0}
          cursor={isDisabled ? "not-allowed" : "pointer"}
        />
        <Box
          w="20px"
          h="20px"
          borderRadius={uiRadii.xs}
          borderWidth="1px"
          borderColor={isActive ? uiColors.accent : uiColors.borderStrong}
          bg={isActive ? uiColors.accent : "white"}
          color="white"
          display="grid"
          placeItems="center"
          transition={uiTransitions.standard}
          _hover={{ borderColor: uiColors.accentHover }}
          _focusWithin={{ boxShadow: uiShadows.focus }}
        >
          {isIndeterminate ? <MinusIcon width={12} /> : null}
          {!isIndeterminate && isChecked ? <CheckIcon width={12} /> : null}
        </Box>
      </Box>

      <Box>
        {label ? (
          <Text fontSize="14px" fontWeight="600" color={uiColors.textPrimary} lineHeight="1.35">
            {label}
          </Text>
        ) : null}
        {description ? (
          <Text mt={0.5} fontSize="12px" color={uiColors.textSecondary}>
            {description}
          </Text>
        ) : null}
      </Box>
    </HStack>
  );
}

export default AppCheckbox;
