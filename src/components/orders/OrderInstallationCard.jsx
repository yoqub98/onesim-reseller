// Renders QR install block and platform links for an order — used in OrderDetailsPage
import { ClipboardDocumentIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { Box, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { AppIconButton, SurfaceCard } from "../ui";
import { uiColors } from "../../design-system/tokens";
import { formatMoneyFromUzs } from "../../utils/currency";

function OrderInstallationCard({ order, links, detail, currency, onCopy }) {
  const qrData = `LPA:1$esim.onesim.uz$${order.iccid}`;

  return (
    <SurfaceCard overflow="hidden" borderRadius="10px">
      <Box bg={uiColors.textPrimary} color="white" px={6} py={6}>
        <HStack spacing={2}>
          <DevicePhoneMobileIcon width={18} />
          <Heading fontSize="28px" fontWeight="500">{detail.installation}</Heading>
        </HStack>
      </Box>
      <VStack align="stretch" spacing={4} p={4}>
        <VStack spacing={3}>
          <Box p={4} borderWidth="1px" borderColor={uiColors.border} borderRadius="14px" bg="white" boxShadow="0px 1px 3px rgba(0,0,0,0.1)">
            <Box
              as="img"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`}
              alt={detail.qrAlt}
              w="160px"
              h="160px"
            />
          </Box>
          <Text fontSize="sm" color={uiColors.textSecondary} textAlign="center" maxW="318px">
            {detail.installationHint}
          </Text>
        </VStack>
        <Box bg={uiColors.pageBg} borderWidth="1px" borderColor="#f1f5f9" borderRadius="10px" px={3} py={3}>
          <HStack justify="space-between">
            <Text fontSize="xs" fontWeight="700" color="#314158">iOS (iPhone)</Text>
            <AppIconButton
              aria-label="Copy iOS link"
              variant="ghost"
              size="xs"
              icon={<ClipboardDocumentIcon width={12} />}
              onClick={() => onCopy(links?.ios, "iOS")}
            />
          </HStack>
          <Text mt={1} fontSize="xs" color={uiColors.textSecondary} noOfLines={1}>{links?.ios || "-"}</Text>
        </Box>
        <Box bg={uiColors.pageBg} borderWidth="1px" borderColor="#f1f5f9" borderRadius="10px" px={3} py={3}>
          <HStack justify="space-between">
            <Text fontSize="xs" fontWeight="700" color="#314158">Android</Text>
            <AppIconButton
              aria-label="Copy Android link"
              variant="ghost"
              size="xs"
              icon={<ClipboardDocumentIcon width={12} />}
              onClick={() => onCopy(links?.android, "Android")}
            />
          </HStack>
          <Text mt={1} fontSize="xs" color={uiColors.textSecondary} noOfLines={1}>{links?.android || "-"}</Text>
        </Box>
        <HStack justify="space-between" pt={1}>
          <Text fontSize="sm" color={uiColors.textSecondary}>{detail.totalPaid}</Text>
          <Text fontWeight="700" color={uiColors.textPrimary}>
            {formatMoneyFromUzs(order.paymentTotalUzs || 0, currency)}
          </Text>
        </HStack>
      </VStack>
    </SurfaceCard>
  );
}

export default OrderInstallationCard;
