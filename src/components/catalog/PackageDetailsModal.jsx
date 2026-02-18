import { useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Grid,
  HStack,
  SimpleGrid,
  Text,
  VStack,
  Wrap
} from "@chakra-ui/react";
import {
  ShoppingBagIcon,
  XMarkIcon,
  GlobeAltIcon,
  SignalIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  WifiIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  CalendarDaysIcon,
  CircleStackIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import CountryFlag from "../common/CountryFlag";
import { AppButton } from "../ui";
import { uiColors, uiRadii } from "../../design-system/tokens";
import { formatPackageDataLabel } from "../../utils/package";

const COUNTRIES_PREVIEW_LIMIT = 8;

function FeatureChip({ icon: Icon, label, active = true }) {
  return (
    <HStack
      spacing={1.5}
      px={3}
      py={1.5}
      borderRadius={uiRadii.pill}
      bg={active ? "rgba(16, 185, 129, 0.08)" : uiColors.surfaceSoft}
      borderWidth="1px"
      borderColor={active ? "rgba(16, 185, 129, 0.25)" : uiColors.border}
    >
      <Icon
        width={14}
        color={active ? "#10b981" : uiColors.textMuted}
      />
      <Text
        fontSize="xs"
        fontWeight="600"
        color={active ? "#047857" : uiColors.textMuted}
      >
        {label}
      </Text>
    </HStack>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <HStack justify="space-between" py={2} borderBottomWidth="1px" borderColor={uiColors.border}>
      <HStack spacing={2}>
        {Icon && <Icon width={14} color={uiColors.textMuted} />}
        <Text fontSize="sm" color={uiColors.textSecondary}>{label}</Text>
      </HStack>
      <Text fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>{value}</Text>
    </HStack>
  );
}

function SectionLabel({ children }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="700"
      textTransform="uppercase"
      letterSpacing="0.05em"
      color={uiColors.textMuted}
      mb={2}
    >
      {children}
    </Text>
  );
}

function getLocationTypeLabel(locationType, dt) {
  if (locationType === "regional") return dt.regional;
  if (locationType === "global") return dt.global;
  return dt.country;
}

function getPackageTypeLabel(dataType, dt) {
  if (Number(dataType) === 2) return dt.dailyUnlimited;
  return dt.standard;
}

function getLocationTypeColor(locationType) {
  if (locationType === "global") return { bg: "rgba(139, 92, 246, 0.1)", color: "#7c3aed" };
  if (locationType === "regional") return { bg: "rgba(59, 130, 246, 0.1)", color: "#2563eb" };
  return { bg: uiColors.accentSoft, color: uiColors.accent };
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
  const [showAllCountries, setShowAllCountries] = useState(false);

  if (!plan) return null;

  const dt = t.detailsModal;
  const locationType = plan.locationType || "country";
  const isDaily = Number(plan.dataType) === 2;
  const hasSms = Number(plan.smsStatus) > 0;
  const coveredCountries = Array.isArray(plan.coveredCountries) ? plan.coveredCountries : [];
  const countriesCount = coveredCountries.length || 1;
  const isMultiCountry = locationType === "regional" || locationType === "global";

  const operators = [];
  if (Array.isArray(plan.locationNetworkList)) {
    plan.locationNetworkList.forEach((loc) => {
      if (Array.isArray(loc?.operatorList)) {
        loc.operatorList.forEach((op) => {
          if (op?.operatorName && !operators.includes(op.operatorName)) {
            operators.push(op.operatorName);
          }
        });
      }
    });
  }

  const ltColor = getLocationTypeColor(locationType);
  const displayCountries = showAllCountries
    ? coveredCountries
    : coveredCountries.slice(0, COUNTRIES_PREVIEW_LIMIT);

  return (
    <Box position="fixed" inset={0} zIndex={50} bg="rgba(15, 23, 43, 0.5)" onClick={onClose}>
      <Box
        position="absolute"
        top={{ base: 0, md: "50%" }}
        left="50%"
        transform={{ base: "translateX(-50%)", md: "translate(-50%, -50%)" }}
        w={{ base: "100%", md: "680px" }}
        maxH={{ base: "100vh", md: "calc(100vh - 48px)" }}
        bg={uiColors.surface}
        borderRadius={{ base: 0, md: "16px" }}
        overflow="hidden"
        display="flex"
        flexDirection="column"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Hero header ─── */}
        <Box
          bg="linear-gradient(135deg, #0f172b 0%, #1e293b 100%)"
          px={6}
          pt={5}
          pb={5}
          position="relative"
        >
          <Flex justify="space-between" align="start" mb={4}>
            <HStack spacing={3} align="center">
              {isMultiCountry ? (
                <Flex
                  w="48px" h="48px"
                  borderRadius="full"
                  bg="rgba(255,255,255,0.12)"
                  align="center" justify="center"
                  flexShrink={0}
                >
                  <GlobeAltIcon width={24} color="white" />
                </Flex>
              ) : (
                <CountryFlag code={plan.countryCode} size={48} />
              )}
              <VStack spacing={0} align="start">
                <Text fontWeight="800" fontSize="lg" color="white" lineHeight="1.3">
                  {plan.name || plan.destination}
                </Text>
                <Text fontSize="sm" color="rgba(255,255,255,0.6)">
                  {plan.destination}
                </Text>
              </VStack>
            </HStack>
            <AppButton
              aria-label="Close"
              variant="ghost"
              minW="36px"
              h="36px"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              onClick={onClose}
            >
              <XMarkIcon width={20} />
            </AppButton>
          </Flex>

          {/* Key stats row */}
          <Grid templateColumns="repeat(3, 1fr)" gap={3}>
            <VStack
              spacing={0.5}
              bg="rgba(255,255,255,0.08)"
              borderRadius={uiRadii.md}
              py={2.5}
              px={3}
            >
              <CircleStackIcon width={16} color="rgba(255,255,255,0.5)" />
              <Text fontWeight="800" fontSize="md" color="white">
                {formatPackageDataLabel(plan, t.units.unlimited)}
              </Text>
              <Text fontSize="2xs" color="rgba(255,255,255,0.5)" textTransform="uppercase">
                {dt.data}
              </Text>
            </VStack>
            <VStack
              spacing={0.5}
              bg="rgba(255,255,255,0.08)"
              borderRadius={uiRadii.md}
              py={2.5}
              px={3}
            >
              <CalendarDaysIcon width={16} color="rgba(255,255,255,0.5)" />
              <Text fontWeight="800" fontSize="md" color="white">
                {plan.validityDays} {t.units.day}
              </Text>
              <Text fontSize="2xs" color="rgba(255,255,255,0.5)" textTransform="uppercase">
                {dt.validity}
              </Text>
            </VStack>
            <VStack
              spacing={0.5}
              bg="rgba(255,255,255,0.08)"
              borderRadius={uiRadii.md}
              py={2.5}
              px={3}
            >
              <SignalIcon width={16} color="rgba(255,255,255,0.5)" />
              <Text fontWeight="800" fontSize="md" color="white">
                {plan.speed || "4G/LTE"}
              </Text>
              <Text fontSize="2xs" color="rgba(255,255,255,0.5)" textTransform="uppercase">
                {dt.speed}
              </Text>
            </VStack>
          </Grid>
        </Box>

        {/* ─── Scrollable body ─── */}
        <Box flex={1} overflowY="auto" px={6} py={5}>
          <VStack spacing={5} align="stretch">

            {/* Features */}
            <Box>
              <SectionLabel>{dt.features}</SectionLabel>
              <Wrap spacing={2}>
                <FeatureChip icon={DevicePhoneMobileIcon} label={dt.dataOnly} />
                <FeatureChip icon={BoltIcon} label={dt.instantActivation} />
                <FeatureChip icon={WifiIcon} label={dt.hotspotSupported} />
                <FeatureChip icon={ArrowPathIcon} label={dt.topUpSupported} />
                <FeatureChip
                  icon={ChatBubbleLeftIcon}
                  label={hasSms ? dt.smsSupported : dt.noSms}
                  active={hasSms}
                />
              </Wrap>
            </Box>

            {/* Pricing */}
            <Box>
              <SectionLabel>{dt.pricing}</SectionLabel>
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
                <Box
                  p={4}
                  borderRadius={uiRadii.md}
                  bg={uiColors.surfaceSoft}
                  borderWidth="1px"
                  borderColor={uiColors.border}
                >
                  <Text fontSize="xs" color={uiColors.textMuted} mb={1}>{dt.b2cPrice}</Text>
                  <Text fontSize="lg" fontWeight="600" color={uiColors.textSecondary} textDecor="line-through">
                    {renderOriginalPrice(plan)}
                  </Text>
                </Box>
                <Box
                  p={4}
                  borderRadius={uiRadii.md}
                  bg="rgba(254, 79, 24, 0.06)"
                  borderWidth="1px"
                  borderColor="rgba(254, 79, 24, 0.2)"
                >
                  <Text fontSize="xs" color={uiColors.accent} mb={1}>{dt.resellerPrice}</Text>
                  <Text fontSize="lg" fontWeight="800" color={uiColors.textPrimary}>
                    {renderResellerPrice(plan)}
                  </Text>
                  {plan.partnerDiscountRate > 0 && (
                    <Badge
                      mt={1}
                      textTransform="none"
                      bg="rgba(16, 185, 129, 0.1)"
                      color="#059669"
                      fontSize="2xs"
                      fontWeight="700"
                    >
                      -{plan.partnerDiscountRate}% {dt.yourDiscount}
                    </Badge>
                  )}
                </Box>
              </Grid>
            </Box>

            {/* Package info */}
            <Box>
              <SectionLabel>{dt.packageInfo}</SectionLabel>
              <Box
                borderRadius={uiRadii.md}
                borderWidth="1px"
                borderColor={uiColors.border}
                px={4}
                overflow="hidden"
              >
                <InfoRow
                  label={dt.packageType}
                  icon={CircleStackIcon}
                  value={
                    <Badge textTransform="none" bg={isDaily ? "rgba(245, 158, 11, 0.1)" : uiColors.surfaceSoft} color={isDaily ? "#d97706" : uiColors.textPrimary} fontSize="xs">
                      {getPackageTypeLabel(plan.dataType, dt)}
                    </Badge>
                  }
                />
                <InfoRow
                  label={dt.locationType}
                  icon={MapPinIcon}
                  value={
                    <Badge textTransform="none" bg={ltColor.bg} color={ltColor.color} fontSize="xs">
                      {getLocationTypeLabel(locationType, dt)} {isMultiCountry && `(${countriesCount} ${dt.countriesCovered})`}
                    </Badge>
                  }
                />
                <InfoRow label={dt.packageCode} icon={null} value={plan.packageCode || "-"} />
                {operators.length > 0 && (
                  <InfoRow
                    label={dt.operators}
                    icon={SignalIcon}
                    value={`${operators.length}`}
                  />
                )}
              </Box>
            </Box>

            {/* Coverage - countries list for multi-country packages */}
            {isMultiCountry && coveredCountries.length > 0 && (
              <Box>
                <SectionLabel>{dt.coverage} ({countriesCount} {dt.countriesCovered})</SectionLabel>
                <Box
                  borderRadius={uiRadii.md}
                  borderWidth="1px"
                  borderColor={uiColors.border}
                  p={4}
                >
                  <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2}>
                    {displayCountries.map((c, i) => (
                      <HStack key={c.code || i} spacing={2}>
                        <CountryFlag code={c.code} size={18} />
                        <Text fontSize="sm" color={uiColors.textPrimary} noOfLines={1}>
                          {c.name || c.code}
                        </Text>
                      </HStack>
                    ))}
                  </SimpleGrid>
                  {coveredCountries.length > COUNTRIES_PREVIEW_LIMIT && (
                    <AppButton
                      variant="ghost"
                      size="sm"
                      mt={3}
                      w="full"
                      fontSize="xs"
                      color={uiColors.accent}
                      onClick={() => setShowAllCountries((prev) => !prev)}
                    >
                      <HStack spacing={1}>
                        {showAllCountries ? (
                          <>
                            <ChevronUpIcon width={14} />
                            <Text>{dt.hideCountries}</Text>
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon width={14} />
                            <Text>{dt.showAllCountries} ({coveredCountries.length - COUNTRIES_PREVIEW_LIMIT}+)</Text>
                          </>
                        )}
                      </HStack>
                    </AppButton>
                  )}
                </Box>
              </Box>
            )}

            {/* Operators list */}
            {operators.length > 0 && (
              <Box>
                <SectionLabel>{dt.network}</SectionLabel>
                <Wrap spacing={2}>
                  {operators.map((name) => (
                    <Badge
                      key={name}
                      textTransform="none"
                      bg={uiColors.surfaceSoft}
                      color={uiColors.textPrimary}
                      borderWidth="1px"
                      borderColor={uiColors.border}
                      px={2.5}
                      py={1}
                      borderRadius={uiRadii.sm}
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {name}
                    </Badge>
                  ))}
                </Wrap>
              </Box>
            )}

            {/* Description */}
            {plan.description && (
              <Box>
                <SectionLabel>{dt.description}</SectionLabel>
                <Text fontSize="sm" color={uiColors.textSecondary} lineHeight="1.6">
                  {plan.description}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* ─── Footer actions ─── */}
        <Box borderTopWidth="1px" borderColor={uiColors.border} px={6} py={4} bg={uiColors.surface}>
          <HStack justify="end" spacing={3}>
            <AppButton variant="soft" h="44px" px={6} onClick={onClose}>
              {t.modal.cancel}
            </AppButton>
            <AppButton
              variant="primary"
              h="44px"
              px={6}
              leftIcon={<ShoppingBagIcon width={16} />}
              onClick={() => onPurchase(plan)}
            >
              {t.buy}
            </AppButton>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}

export default PackageDetailsModal;
