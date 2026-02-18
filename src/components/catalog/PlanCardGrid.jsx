import { EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Badge, Box, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import {
  AppButton,
  AppDataTable,
  AppDataTableCell,
  AppDataTableRow,
  AppIconButton,
  PackageDisplay,
  Pagination,
  SurfaceCard
} from "../ui";
import { uiColors, uiRadii } from "../../design-system/tokens";
import { formatPackageDataLabel } from "../../utils/package";

function PlanCardGrid({
  t,
  isLoading,
  error,
  plans,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
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
    <VStack spacing={4} align="stretch">
      <SurfaceCard overflow="hidden">
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
                  {renderOriginalPrice(plan)}
                </Text>
                <Text color={uiColors.textPrimary} fontSize="md" fontWeight="700">
                  {renderResellerPrice(plan)}
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
      </SurfaceCard>

      <Box px={2}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={null}
          pageSize={pageSize}
        />
      </Box>
    </VStack>
  );
}

export default PlanCardGrid;
