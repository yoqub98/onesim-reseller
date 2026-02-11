import { HStack, Wrap, WrapItem } from "@chakra-ui/react";
import { AppButton } from "./AppButton";

function FilterChips({ value, options, onChange }) {
  return (
    <Wrap spacing={2} shouldWrapChildren>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <WrapItem key={option.value}>
            <AppButton
              variant={isActive ? "dark" : "soft"}
              h="36px"
              minW="fit-content"
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </AppButton>
          </WrapItem>
        );
      })}
    </Wrap>
  );
}

function SegmentedControl({ value, options, onChange }) {
  return (
    <HStack
      bg="#f1f5f9"
      borderWidth="1px"
      borderColor="#e2e8f0"
      borderRadius="10px"
      p="4px"
      spacing="4px"
      w="fit-content"
    >
      {options.map((option) => (
        <AppButton
          key={option.value}
          variant={value === option.value ? "soft" : "ghost"}
          h="34px"
          px={3}
          bg={value === option.value ? "white" : "transparent"}
          boxShadow={value === option.value ? "0px 1px 2px rgba(15, 23, 43, 0.12)" : "none"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </AppButton>
      ))}
    </HStack>
  );
}

export { FilterChips, SegmentedControl };
