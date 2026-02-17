// Renders catalog plan rows/cards in table or card layout - used in CatalogPage
import { EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Badge, Box, Grid, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import CountryFlag from "../common/CountryFlag";
import {
  AppButton,
  AppDataTable,
  AppDataTableCell,
  AppDataTableRow,
  AppIconButton,
  PackageDisplay,
  SurfaceCard
} from "../ui";
import { uiColors, uiRadii } from "../../design-system/tokens";
import { formatPackageDataLabel } from "../../utils/package";

function PlanCardGrid({
  t,
  view,
  isLoading,
  error,
  plans,
  onOpenDetails,
  onBuy,
  renderOriginalPrice,
  renderResellerPrice
}) {
  if (error) {
    return (
      <SurfaceCard p={4} borderColor="#fecaca">
        <Text color="#b91c1c" fontSize="sm">{error}</Text>
      </SurfaceCard>
    );
  }

  if (isLoading) {
    return (
      <SurfaceCard p={4}>
        <VStack spacing={3} align="stretch">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} height="62px" borderRadius={uiRadii.sm} />
          ))}
        </VStack>
      </SurfaceCard>
    );
  }

  if (!plans.length) {
    return (
      <SurfaceCard p={8} textAlign="center">
        <Text color={uiColors.textSecondary}>{t.noPlans}</Text>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard overflow="hidden">
      {view === "table" ? (
        <AppDataTable
          minWidth="920px"
          columns="2.2fr 1.4fr 1fr 1fr 1.6fr"
          headers={[t.table.package, t.table.price, t.table.validity, t.table.speed, t.table.actions]}
        >
          {plans.map((plan) => (
            <AppDataTableRow
              key={plan.id}
              columns="2.2fr 1.4fr 1fr 1fr 1.6fr"
              cursor="pointer"
              _hover={{ bg: "#f8fafc" }}
              onClick={() => onOpenDetails(plan)}
            >
              <AppDataTableCell>
                <PackageDisplay
                  countryCode={plan.countryCode}
                  destination={plan.destination}
                  dataLabel={formatPackageDataLabel(plan, t.units.unlimited)}
                  flagSize={40}
                />
              </AppDataTableCell>

              <AppDataTableCell>
                <Text color={uiColors.textMuted} textDecor="line-through" fontSize="xs" fontWeight="500">
                  {renderOriginalPrice(plan)} (+{plan.defaultMarginPercent || 0}%)
                </Text>
                <Text color={uiColors.textPrimary} fontSize="md" fontWeight="700">
                  {renderResellerPrice(plan)} (-{plan.partnerDiscountRate || 0}%)
                </Text>
              </AppDataTableCell>

              <AppDataTableCell>
                <Text color="#45556c" fontSize="sm">
                  {plan.validityDays} {t.units.day}
                </Text>
              </AppDataTableCell>

              <AppDataTableCell>
                <Badge
                  bg={uiColors.accentSoft}
                  color={uiColors.accent}
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  fontWeight="500"
                  textTransform="none"
                >
                  {plan.speed || plan.coverage}
                </Badge>
              </AppDataTableCell>

              <AppDataTableCell align="right">
                <HStack justify="end" spacing={2} onClick={(event) => event.stopPropagation()}>
                  <AppIconButton
                    aria-label="Batafsil"
                    icon={<EyeIcon width={16} />}
                    variant="ghost"
                    onClick={() => onOpenDetails(plan)}
                  />
                  <AppIconButton aria-label="Sevimlilar" icon={<HeartIcon width={16} />} variant="ghost" />
                  <AppButton variant="outline" h="36px" px={5} onClick={() => onBuy(plan)}>
                    {t.buy}
                  </AppButton>
                </HStack>
              </AppDataTableCell>
            </AppDataTableRow>
          ))}
        </AppDataTable>
      ) : (
        <Grid p={4} gap={3} templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}>
          {plans.map((plan) => (
            <SurfaceCard key={plan.id} p={4} boxShadow="none">
              <HStack justify="space-between" align="start">
                <HStack spacing={3}>
                  <CountryFlag code={plan.countryCode} size={32} />
                  <Box>
                    <Text fontWeight="700" color={uiColors.textPrimary}>{plan.destination}</Text>
                    <Text fontSize="xs" color={uiColors.textSecondary}>{formatPackageDataLabel(plan, t.units.unlimited)}</Text>
                  </Box>
                </HStack>
                <Badge bg={uiColors.accentSoft} color={uiColors.accent} textTransform="none">
                  {plan.speed || plan.coverage}
                </Badge>
              </HStack>

              <Text mt={3} textDecor="line-through" color={uiColors.textMuted} fontSize="xs">
                {renderOriginalPrice(plan)} (+{plan.defaultMarginPercent || 0}%)
              </Text>
              <Text color={uiColors.textPrimary} fontWeight="700">
                {renderResellerPrice(plan)} (-{plan.partnerDiscountRate || 0}%)
              </Text>
              <Text fontSize="sm" color={uiColors.textSecondary}>{plan.validityDays} {t.units.day}</Text>

              <HStack mt={3} spacing={2}>
                <AppButton variant="ghost" onClick={() => onOpenDetails(plan)}>
                  {t.details}
                </AppButton>
                <AppButton variant="outline" onClick={() => onBuy(plan)}>
                  {t.buy}
                </AppButton>
              </HStack>
            </SurfaceCard>
          ))}
        </Grid>
      )}
    </SurfaceCard>
  );
}

export default PlanCardGrid;
