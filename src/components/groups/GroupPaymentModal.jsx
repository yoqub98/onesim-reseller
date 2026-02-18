import { CreditCardIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";
import { AppButton, AppIconButton, SurfaceCard } from "../ui";

function formatUzs(value) {
  return `${Number(value || 0).toLocaleString("ru-RU").replace(/,/g, " ")} UZS`;
}

function SummaryRow({ label, value, strong, color }) {
  return (
    <HStack justify="space-between" align="center">
      <Text fontSize={strong ? "sm" : "xs"} color={uiColors.textSecondary}>
        {label}
      </Text>
      <Text fontSize={strong ? "lg" : "sm"} fontWeight={strong ? "800" : "600"} color={color || uiColors.textPrimary}>
        {value}
      </Text>
    </HStack>
  );
}

function GroupPaymentModal({ isOpen, payment, labels, onClose, onConfirm }) {
  if (!isOpen || !payment) return null;

  return (
    <>
      <Box position="fixed" inset={0} bg="rgba(15, 23, 43, 0.48)" backdropFilter="blur(2px)" zIndex={60} />
      <Box position="fixed" inset={0} zIndex={70} display="grid" placeItems="center" p={4}>
        <SurfaceCard w="full" maxW="520px" borderRadius="14px" overflow="hidden">
          <HStack px={5} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <HStack spacing={3}>
              <Box bg={uiColors.accentSoft} color={uiColors.accent} p={2} borderRadius="10px">
                <CreditCardIcon width={18} />
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="lg" color={uiColors.textPrimary}>{labels.title}</Text>
                <Text fontSize="sm" color={uiColors.textSecondary}>{payment.groupName}</Text>
              </Box>
            </HStack>
            <AppIconButton variant="ghost" aria-label={labels.close} icon={<XMarkIcon width={18} />} onClick={onClose} />
          </HStack>

          <VStack align="stretch" spacing={4} p={5}>
            <SurfaceCard p={3.5} borderRadius="10px" bg={uiColors.surfaceSoft}>
              <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase">{labels.package}</Text>
              <Text mt={1} fontWeight="700" color={uiColors.textPrimary}>{payment.packageName}</Text>
              <Text mt={0.5} fontSize="sm" color={uiColors.textSecondary}>{payment.packageMeta}</Text>
            </SurfaceCard>

            <VStack align="stretch" spacing={2}>
              <SummaryRow label={labels.howMany} value={`${payment.quantity} ta`} />
              <SummaryRow label={labels.total} value={formatUzs(payment.grossTotalUzs)} />
              <SummaryRow label={labels.totalDeducted} value={`- ${formatUzs(payment.deductedUzs)}`} color="#15803d" />
              <Box borderTopWidth="1px" borderColor={uiColors.border} my={0.5} />
              <SummaryRow label={labels.subtotal} value={formatUzs(payment.subtotalUzs)} strong />
            </VStack>
          </VStack>

          <HStack px={5} py={4} borderTopWidth="1px" borderColor={uiColors.border} justify="end" bg={uiColors.surfaceSoft}>
            <AppButton onClick={onClose}>{labels.close}</AppButton>
            <AppButton variant="primary" onClick={onConfirm}>
              {labels.payAndConfirm}
            </AppButton>
          </HStack>
        </SurfaceCard>
      </Box>
    </>
  );
}

export default GroupPaymentModal;
