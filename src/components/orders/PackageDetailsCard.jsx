// Renders usage and package detail cards for an order — used in OrderDetailsPage
import { BoltIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { Badge, Box, Grid, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import CountryFlag from "../common/CountryFlag";
import { AppButton, AppIconButton, SurfaceCard } from "../ui";
import { uiColors } from "../../design-system/tokens";

function formatUsage(used, total) {
  if (total === 999) {
    return `${Number(used || 0).toFixed(1)} GB / INFINITY GB`;
  }

  return `${Number(used || 0).toFixed(1)} GB / ${Number(total || 0)} GB`;
}

function usagePercent(used, total) {
  if (!total || total <= 0 || total === 999) {
    return 5;
  }

  return Math.max(0, Math.min(100, (Number(used || 0) / total) * 100));
}

function getRemainingDays(purchasedAt, validityDays, status) {
  if (status === "expired" || !purchasedAt || !validityDays) {
    return 0;
  }

  const elapsedDays = Math.floor((Date.now() - new Date(purchasedAt).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(validityDays - elapsedDays, 0);
}

function PackageDetailsCard({ order, detail, onCopy, onTopupClick }) {
  const remainingDays = getRemainingDays(order.purchasedAt, order.package.validityDays, order.status);

  return (
    <VStack align="stretch" spacing={4}>
      <SurfaceCard p={4} borderRadius="10px">
        <HStack justify="space-between" align="center" mb={3}>
          <Heading fontSize="24px" color={uiColors.textPrimary}>{detail.usageTitle}</Heading>
          <AppButton
            variant="soft"
            h="30px"
            px={3}
            borderWidth="1px"
            borderColor="#ffd6a8"
            color="#f54900"
            startElement={<BoltIcon width={14} />}
            onClick={onTopupClick}
          >
            {detail.actions.addPackage}
          </AppButton>
        </HStack>

        <HStack justify="space-between" mb={1}>
          <Text color={uiColors.textSecondary} fontSize="sm">{detail.used}</Text>
          <Text color={uiColors.textPrimary} fontSize="sm">{formatUsage(order.dataUsageGb, order.totalDataGb)}</Text>
        </HStack>
        <Box h="8px" borderRadius="full" bg={uiColors.surfaceSoft} overflow="hidden">
          <Box h="full" w={`${usagePercent(order.dataUsageGb, order.totalDataGb)}%`} bg={uiColors.accent} />
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3} mt={4}>
          <Box bg={uiColors.pageBg} borderWidth="1px" borderColor={uiColors.border} borderRadius="10px" p={3}>
            <Text fontSize="10px" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
              {detail.remainingDays}
            </Text>
            <Text mt={1} fontSize="31px" lineHeight="1.1" fontWeight="800" color={uiColors.textPrimary}>{remainingDays}</Text>
          </Box>
          <Box bg={uiColors.pageBg} borderWidth="1px" borderColor={uiColors.border} borderRadius="10px" p={3}>
            <HStack justify="space-between" align="start">
              <Box>
                <Text fontSize="10px" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                  {detail.iccid}
                </Text>
                <Text mt={1} fontSize="13px" fontFamily="mono" color={uiColors.textPrimary}>{order.iccid}</Text>
              </Box>
              <AppIconButton
                aria-label={detail.iccid}
                variant="ghost"
                size="xs"
                icon={<ClipboardDocumentIcon width={12} />}
                onClick={() => onCopy(order.iccid, detail.iccid)}
              />
            </HStack>
          </Box>
        </Grid>
      </SurfaceCard>

      <SurfaceCard p={4} borderRadius="10px">
        <Heading fontSize="24px" color={uiColors.textPrimary} mb={4}>{detail.packageTitle}</Heading>
        <Box p={3} borderRadius="10px" borderWidth="1px" borderColor={uiColors.border} bg={uiColors.pageBg}>
          <HStack spacing={3}>
            <CountryFlag code={order.package.countryCode} size={24} />
            <Box>
              <Text fontWeight="700" color={uiColors.textPrimary}>
                {order.package.destination} {order.package.dataGb === -1 ? "INFINITY" : `${order.package.dataGb}GB`}
              </Text>
              <Text fontSize="sm" color={uiColors.textSecondary}>
                {detail.packageCode}: <Text as="span" fontFamily="mono" color={uiColors.textPrimary}>{order.package.code}</Text>
              </Text>
            </Box>
          </HStack>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
          <Box>
            <Text fontSize="sm" color={uiColors.textSecondary}>{detail.operators}</Text>
            <HStack mt={1} spacing={1.5} flexWrap="wrap">
              {(order.package.operators || []).map((operator) => (
                <Badge key={operator} bg={uiColors.pageBg} color="#314158" borderWidth="1px" borderColor={uiColors.border} textTransform="none">
                  {operator}
                </Badge>
              ))}
            </HStack>
          </Box>
          <Box>
            <Text fontSize="sm" color={uiColors.textSecondary}>{detail.network}</Text>
            <Text mt={1} fontWeight="500" fontSize="lg" color={uiColors.textPrimary}>{order.package.speed}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color={uiColors.textSecondary}>{detail.hotspot}</Text>
            <Text mt={1} fontWeight="500" fontSize="lg" color={uiColors.textPrimary}>
              {order.package.hotspotSupported ? detail.available : detail.unavailable}
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" color={uiColors.textSecondary}>{detail.validity}</Text>
            <Text mt={1} fontWeight="500" fontSize="lg" color={uiColors.textPrimary}>{order.package.validityDays} {detail.days}</Text>
          </Box>
        </Grid>
      </SurfaceCard>
    </VStack>
  );
}

export default PackageDetailsCard;
