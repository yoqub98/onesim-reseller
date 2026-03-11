import { Box, HStack, Text } from "@chakra-ui/react";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";
import { uiColors, uiShadows, uiTransitions } from "../../design-system/tokens";

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
      opacity={isDisabled ? 0.5 : 1}
      w="fit-content"
      role="checkbox"
      aria-checked={isIndeterminate ? "mixed" : isChecked}
    >
      <Box position="relative" flexShrink={0}>
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
          w="16px"
          h="16px"
          borderRadius="4px"
          borderWidth="2px"
          borderColor={isActive ? uiColors.accent : uiColors.borderStrong}
          bg={isActive ? uiColors.accent : "white"}
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition={uiTransitions.standard}
          _hover={!isDisabled ? { borderColor: isActive ? uiColors.accentHover : uiColors.accent } : {}}
          _focusWithin={{ boxShadow: uiShadows.focus }}
        >
          {isIndeterminate ? <MinusIcon width={10} strokeWidth={3} /> : null}
          {!isIndeterminate && isChecked ? <CheckIcon width={10} strokeWidth={3} /> : null}
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
