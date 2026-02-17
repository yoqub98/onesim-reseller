import {
  Badge,
  Box,
  Flex,
  Grid,
  HStack,
  Text,
  VStack
} from "@chakra-ui/react";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CountryFlag from "../common/CountryFlag";
import { AppButton, SurfaceCard } from "../ui";
import { uiColors } from "../../design-system/tokens";
import { formatPackageDataLabel } from "../../utils/package";

function getPackageTypeLabel(plan, unlimitedLabel) {
  if (Number(plan?.dataType) === 2) {
    return `${unlimitedLabel} / Daily`;
  }
  return "Standard";
}

function PackageDetailsModal({
  t,
  currency,
  plan,
  onClose,
  onPurchase,
  renderOriginalPrice,
  renderResellerPrice
}) {
  if (!plan) {
    return null;
  }

  const locationType = plan.locationType || "country";
  const countriesCovered = Array.isArray(plan.coveredCountries) ? plan.coveredCountries.length : 0;
  const operatorsCount = Array.isArray(plan.locationNetworkList)
    ? plan.locationNetworkList.reduce((sum, item) => sum + (item?.operatorList?.length || 0), 0)
    : 0;

  return (
    <Box position="fixed" inset={0} zIndex={50} bg="rgba(15, 23, 43, 0.45)" onClick={onClose}>
      <SurfaceCard
        position="absolute"
        top={{ base: 2, md: "50%" }}
        left="50%"
        transform={{ base: "translateX(-50%)", md: "translate(-50%, -50%)" }}
        w={{ base: "calc(100% - 8px)", md: "760px" }}
        maxH={{ base: "calc(100vh - 8px)", md: "calc(100vh - 32px)" }}
        borderRadius="14px"
        overflow="hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <Flex px={5} h="64px" align="center" justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
          <Text fontWeight="800" fontSize={{ base: "lg", md: "20px" }} color={uiColors.textPrimary}>{t.details}</Text>
          <AppButton
            aria-label={t.panelClose || "Close"}
            variant="ghost"
            minW="36px"
            h="36px"
            onClick={onClose}
          >
            <XMarkIcon width={18} />
          </AppButton>
        </Flex>

        <Box p={5} bg="rgba(248,250,252,0.6)" maxH={{ base: "72vh", md: "560px" }} overflowY="auto">
          <HStack spacing={3} align="start" mb={4}>
            <CountryFlag code={plan.countryCode} size={36} />
            <VStack spacing={0.5} align="start" flex={1}>
              <Text fontWeight="800" color={uiColors.textPrimary}>{plan.name || plan.destination}</Text>
              <Text fontSize="sm" color={uiColors.textSecondary}>
                {plan.destination} - {formatPackageDataLabel(plan, t.units.unlimited)} - {plan.validityDays} {t.units.day}
              </Text>
            </VStack>
            <Badge textTransform="none" bg={uiColors.accentSoft} color={uiColors.accent}>
              {plan.speed || "4G/LTE"}
            </Badge>
          </HStack>

          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <SurfaceCard p={4}>
              <Text fontSize="xs" color={uiColors.textSecondary} mb={1}>B2C Price</Text>
              <Text fontSize="sm" color={uiColors.textMuted} textDecor="line-through">
                {renderOriginalPrice(plan)} (+{plan.defaultMarginPercent || 0}%)
              </Text>
              <Text fontSize="xs" color={uiColors.textSecondary} mt={3} mb={1}>Reseller Price ({currency})</Text>
              <Text fontWeight="800" fontSize="xl" color={uiColors.textPrimary}>
                {renderResellerPrice(plan)} (-{plan.partnerDiscountRate || 0}%)
              </Text>
            </SurfaceCard>

            <SurfaceCard p={4}>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between"><Text fontSize="sm" color={uiColors.textSecondary}>Package Code</Text><Text fontWeight="600">{plan.packageCode || "-"}</Text></HStack>
                <HStack justify="space-between"><Text fontSize="sm" color={uiColors.textSecondary}>Slug</Text><Text fontWeight="600">{plan.slug || "-"}</Text></HStack>
                <HStack justify="space-between"><Text fontSize="sm" color={uiColors.textSecondary}>Location Type</Text><Text fontWeight="600" textTransform="capitalize">{locationType}</Text></HStack>
                <HStack justify="space-between"><Text fontSize="sm" color={uiColors.textSecondary}>Package Type</Text><Text fontWeight="600">{getPackageTypeLabel(plan, t.units.unlimited)}</Text></HStack>
                <HStack justify="space-between"><Text fontSize="sm" color={uiColors.textSecondary}>SMS Support</Text><Text fontWeight="600">{Number(plan.smsStatus) > 0 ? "Yes" : "No"}</Text></HStack>
                <HStack justify="space-between"><Text fontSize="sm" color={uiColors.textSecondary}>Countries Covered</Text><Text fontWeight="600">{countriesCovered || 1}</Text></HStack>
                <HStack justify="space-between"><Text fontSize="sm" color={uiColors.textSecondary}>Operators</Text><Text fontWeight="600">{operatorsCount}</Text></HStack>
              </VStack>
            </SurfaceCard>
          </Grid>

          {plan.description ? (
            <SurfaceCard p={4} mt={4}>
              <Text fontSize="xs" color={uiColors.textSecondary} mb={2}>Description</Text>
              <Text fontSize="sm" color={uiColors.textPrimary}>{plan.description}</Text>
            </SurfaceCard>
          ) : null}
        </Box>

        <Box borderTopWidth="1px" borderColor={uiColors.border} />
        <HStack px={5} py={4} justify="end" spacing={3}>
          <AppButton variant="soft" h="44px" px={6} onClick={onClose}>{t.modal.cancel}</AppButton>
          <AppButton variant="primary" h="44px" px={6} leftIcon={<ShoppingBagIcon width={16} />} onClick={() => onPurchase(plan)}>
            {t.buy}
          </AppButton>
        </HStack>
      </SurfaceCard>
    </Box>
  );
}

export default PackageDetailsModal;
