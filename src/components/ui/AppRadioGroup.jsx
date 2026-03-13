import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { uiColors, uiShadows, uiTransitions } from "../../design-system/tokens";

function RadioOption({ option, isSelected, name, onChange, isDisabled }) {
  return (
    <HStack
      as="label"
      spacing={3}
      align="start"
      cursor={isDisabled ? "not-allowed" : "pointer"}
      opacity={isDisabled ? 0.5 : 1}
      w="fit-content"
      role="radio"
      aria-checked={isSelected}
    >
      <Box position="relative" flexShrink={0}>
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={isSelected}
          disabled={isDisabled}
          onChange={() => onChange(option.value)}
          style={{ position: "absolute", inset: 0, opacity: 0, margin: 0, cursor: isDisabled ? "not-allowed" : "pointer" }}
        />
        <Box
          w="18px"
          h="18px"
          borderRadius="50%"
          borderWidth="2px"
          borderColor={isSelected ? uiColors.accent : uiColors.borderStrong}
          bg="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition={uiTransitions.standard}
          _hover={!isDisabled ? { borderColor: isSelected ? uiColors.accentHover : uiColors.accent } : {}}
          _focusWithin={{ boxShadow: uiShadows.focus }}
        >
          <Box
            w="8px"
            h="8px"
            borderRadius="50%"
            bg={uiColors.accent}
            transform={isSelected ? "scale(1)" : "scale(0)"}
            opacity={isSelected ? 1 : 0}
            transition={uiTransitions.standard}
          />
        </Box>
      </Box>

      <Stack spacing={0.5}>
        <Text fontSize="14px" fontWeight="600" color={uiColors.textPrimary} lineHeight="1.35">
          {option.label}
        </Text>
        {option.description ? (
          <Text fontSize="12px" color={uiColors.textSecondary}>
            {option.description}
          </Text>
        ) : null}
      </Stack>
    </HStack>
  );
}

function AppRadioGroup({
  label,
  options = [],
  value,
  onChange,
  name = "app-radio-group",
  direction = "column",
  isDisabled = false
}) {
  const Layout = direction === "row" ? HStack : Stack;

  return (
    <Stack spacing={3}>
      {label ? (
        <Text fontSize="13px" fontWeight="600" color={uiColors.textPrimary}>
          {label}
        </Text>
      ) : null}
      <Layout spacing={3} align="start" flexWrap="wrap">
        {options.map((option) => (
          <RadioOption
            key={option.value}
            option={option}
            name={name}
            isSelected={option.value === value}
            onChange={onChange}
            isDisabled={isDisabled || option.disabled}
          />
        ))}
      </Layout>
    </Stack>
  );
}

export default AppRadioGroup;
