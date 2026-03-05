import { HStack, Stack, Text } from "@chakra-ui/react";
import { uiColors, uiRadii, uiShadows, uiTransitions } from "../../design-system/tokens";

function RadioOption({ option, isSelected, name, onChange, isDisabled }) {
  return (
    <HStack
      as="label"
      spacing={3}
      align="start"
      cursor={isDisabled ? "not-allowed" : "pointer"}
      opacity={isDisabled ? 0.65 : 1}
      w="fit-content"
    >
      <HStack position="relative" mt="1px">
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={isSelected}
          disabled={isDisabled}
          onChange={() => onChange(option.value)}
          style={{ position: "absolute", inset: 0, opacity: 0, margin: 0, cursor: isDisabled ? "not-allowed" : "pointer" }}
        />
        <HStack
          w="20px"
          h="20px"
          borderRadius={uiRadii.pill}
          borderWidth="1px"
          borderColor={isSelected ? uiColors.accent : uiColors.borderStrong}
          bg="white"
          justify="center"
          align="center"
          transition={uiTransitions.standard}
          _focusWithin={{ boxShadow: uiShadows.focus }}
        >
          {isSelected ? <HStack w="10px" h="10px" borderRadius={uiRadii.pill} bg={uiColors.accent} /> : null}
        </HStack>
      </HStack>

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
