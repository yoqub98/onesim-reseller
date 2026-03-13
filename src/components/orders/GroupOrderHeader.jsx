/**
 * GroupOrderHeader - Header component for Group Order Details page
 *
 * Displays:
 * - Back button
 * - Group name and order ID
 * - Package info
 * - Print all QR codes button
 */
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";
import { AppButton, SurfaceCard, PackageDisplay } from "../ui";
import { EsimStatusBadge } from "../ui";

function formatDate(dateString) {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function GroupOrderHeader({
  order,
  t,
  onBack,
  onPrintAll
}) {
  if (!order) return null;

  const pkg = order.package || {};

  return (
    <VStack align="stretch" spacing={4}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <AppButton
          variant="ghost"
          h="40px"
          px={0}
          leftIcon={<ArrowLeftIcon width={16} />}
          onClick={onBack}
        >
          {t?.back || "Orqaga"}
        </AppButton>

        <AppButton
          variant="outline"
          h="40px"
          leftIcon={<PrinterIcon width={16} />}
          onClick={onPrintAll}
        >
          {t?.printAllQr || "Barcha QR chop etish"}
        </AppButton>
      </HStack>

      <SurfaceCard p={5}>
        <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={2}>
            <HStack spacing={3} flexWrap="wrap">
              <Text fontSize="2xl" fontWeight="800" color={uiColors.textPrimary}>
                {order.groupName}
              </Text>
              <EsimStatusBadge status={order.status} size="md" />
            </HStack>

            <HStack spacing={4} color={uiColors.textSecondary} fontSize="sm" flexWrap="wrap">
              <Text>
                <Text as="span" fontWeight="600">ID:</Text> {order.id}
              </Text>
              <Text>•</Text>
              <Text>
                <Text as="span" fontWeight="600">{t?.orderDate || "Buyurtma"}:</Text> {formatDate(order.createdAt)}
              </Text>
              <Text>•</Text>
              <Text>
                <Text as="span" fontWeight="600">{t?.travelDates || "Sayohat"}:</Text>{" "}
                {formatDate(order.travelStartDate)} — {formatDate(order.travelEndDate)}
              </Text>
            </HStack>
          </VStack>

          <Box>
            <PackageDisplay
              countryCode={pkg.countryCode}
              destination={pkg.destination || pkg.name}
              dataLabel={`${pkg.dataGb} GB / ${pkg.validityDays} kun`}
              flagSize={36}
              titleSize="md"
              subtitleSize="sm"
            />
          </Box>
        </HStack>
      </SurfaceCard>
    </VStack>
  );
}

export default GroupOrderHeader;
