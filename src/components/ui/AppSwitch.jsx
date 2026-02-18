import { Box, HStack, Switch, Text } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";

function AppSwitch({ label, description, ...props }) {
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
      <Switch colorScheme="orange" {...props} />
    </HStack>
  );
}

export default AppSwitch;
