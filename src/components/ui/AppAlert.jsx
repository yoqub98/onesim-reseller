import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { uiColors, uiRadii } from "../../design-system/tokens";
import { AppButton } from "./AppButton";

const alertVariants = {
  info: {
    icon: InformationCircleIcon,
    borderColor: "#bfdbfe",
    bg: uiColors.infoSoft,
    titleColor: "#1e3a8a"
  },
  success: {
    icon: CheckCircleIcon,
    borderColor: "#86efac",
    bg: uiColors.successSoft,
    titleColor: "#166534"
  },
  warning: {
    icon: ExclamationCircleIcon,
    borderColor: "#fcd34d",
    bg: uiColors.warningSoft,
    titleColor: "#92400e"
  },
  error: {
    icon: XCircleIcon,
    borderColor: "#fca5a5",
    bg: uiColors.errorSoft,
    titleColor: "#991b1b"
  }
};

function AppAlert({
  status = "info",
  title,
  description,
  actionLabel,
  onAction,
  isCompact = false
}) {
  const variant = alertVariants[status] || alertVariants.info;
  const Icon = variant.icon;

  return (
    <HStack
      spacing={3}
      align="start"
      w="full"
      borderWidth="1px"
      borderColor={variant.borderColor}
      bg={variant.bg}
      borderRadius={uiRadii.lg}
      px={4}
      py={isCompact ? 2.5 : 3}
    >
      <Box as={Icon} w={5} h={5} color={variant.titleColor} mt={0.5} flexShrink={0} />

      <VStack align="stretch" spacing={1} flex="1" minW={0}>
        {title ? (
          <Text fontSize="14px" fontWeight="700" color={variant.titleColor}>
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text fontSize="13px" color={uiColors.textSecondary}>
            {description}
          </Text>
        ) : null}
      </VStack>

      {actionLabel && onAction ? (
        <AppButton size="xs" variant="outline" onClick={onAction}>
          {actionLabel}
        </AppButton>
      ) : null}
    </HStack>
  );
}

export default AppAlert;
