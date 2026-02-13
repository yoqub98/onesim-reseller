import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii, uiShadows } from "../../design-system/tokens";

const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    borderColor: "#bbf7d0",
    bg: "#f0fdf4",
    textColor: "#166534"
  },
  error: {
    icon: XCircleIcon,
    borderColor: "#fecaca",
    bg: "#fef2f2",
    textColor: "#991b1b"
  },
  warning: {
    icon: ExclamationCircleIcon,
    borderColor: "#fde68a",
    bg: "#fffbeb",
    textColor: "#92400e"
  },
  info: {
    icon: InformationCircleIcon,
    borderColor: "#bfdbfe",
    bg: "#eff6ff",
    textColor: "#1d4ed8"
  }
};

function AppToastStack({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <Box position="fixed" top={5} right={5} zIndex={60} pointerEvents="none">
      <VStack align="stretch" spacing={2}>
        {items.map((item) => {
          const config = toastConfig[item.type] || toastConfig.info;
          const Icon = config.icon;

          return (
            <HStack
              key={item.id}
              spacing={2}
              align="start"
              pointerEvents="auto"
              w={{ base: "xs", md: "sm" }}
              bg={config.bg}
              borderWidth="1px"
              borderColor={config.borderColor}
              borderRadius={uiRadii.md}
              boxShadow={uiShadows.soft}
              px={3}
              py={3}
            >
              <Box as={Icon} color={config.textColor} w={5} h={5} flexShrink={0} mt={0.5} />
              <Box minW={0}>
                {item.title ? (
                  <Text fontSize="sm" fontWeight="700" color={uiColors.textPrimary} noOfLines={2}>
                    {item.title}
                  </Text>
                ) : null}
                {item.description ? (
                  <Text fontSize="xs" color={uiColors.textSecondary} mt={item.title ? 0.5 : 0}>
                    {item.description}
                  </Text>
                ) : null}
              </Box>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
}

export default AppToastStack;
