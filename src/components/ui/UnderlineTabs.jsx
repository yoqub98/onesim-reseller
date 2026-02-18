import { Box, HStack } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";

function UnderlineTabs({ value, options, onChange }) {
  return (
    <HStack
      spacing={6}
      w="fit-content"
      align="stretch"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Box
            key={option.value}
            as="button"
            type="button"
            px={3}
            h="42px"
            border="none"
            bg="transparent"
            borderRadius="0"
            borderBottom="2px solid"
            borderBottomColor={isActive ? uiColors.accent : "transparent"}
            color={isActive ? uiColors.accent : uiColors.textSecondary}
            fontWeight={isActive ? "700" : "500"}
            lineHeight="1"
            _hover={{ color: isActive ? uiColors.accent : uiColors.textPrimary }}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Box>
        );
      })}
    </HStack>
  );
}

export default UnderlineTabs;
