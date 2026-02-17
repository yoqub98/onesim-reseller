// Renders the destination and package filter controls — used in CatalogPage
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Box, Grid, HStack, Text } from "@chakra-ui/react";
import { AppInput, AppSelect, FilterChips, SurfaceCard } from "../ui";
import { uiColors } from "../../design-system/tokens";

function CatalogFilters({
  t,
  filters,
  destinationOptions,
  locationTypeOptions,
  packageTypeOptions,
  dataFilterOptions,
  dayFilterOptions,
  onChange
}) {
  const locationTypeLabel = t.filters.locationType || "Location type";
  const packageTypeLabel = t.filters.packageType || "Package type";

  return (
    <SurfaceCard p={{ base: 4, md: 5 }}>
      <HStack mb={3} spacing={2} color={uiColors.textPrimary}>
        <FunnelIcon width={16} />
        <Text fontWeight="600">{t.filtersTitle}</Text>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "1.1fr 1fr 1fr 1fr" }} gap={4}>
        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {t.filters.search}
          </Text>
          <AppInput
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder={t.filters.search}
          />
        </Box>

        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {t.filters.destination}
          </Text>
          <AppSelect
            value={filters.destination}
            onChange={(event) => onChange({ destination: event.target.value })}
          >
            {destinationOptions.map((destination) => (
              <option key={destination} value={destination}>
                {destination === "all" ? t.units.all : destination}
              </option>
            ))}
          </AppSelect>
        </Box>

        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {locationTypeLabel}
          </Text>
          <AppSelect
            value={filters.locationType}
            onChange={(event) => onChange({ locationType: event.target.value })}
          >
            {locationTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AppSelect>
        </Box>

        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {packageTypeLabel}
          </Text>
          <AppSelect
            value={filters.packageType}
            onChange={(event) => onChange({ packageType: event.target.value })}
          >
            {packageTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AppSelect>
        </Box>
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4} mt={4}>
        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {t.filters.gb}
          </Text>
          <FilterChips
            value={filters.data}
            options={dataFilterOptions}
            onChange={(value) => onChange({ data: value })}
          />
        </Box>

        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {t.filters.days}
          </Text>
          <FilterChips
            value={filters.days}
            options={dayFilterOptions}
            onChange={(value) => onChange({ days: value })}
          />
        </Box>
      </Grid>
    </SurfaceCard>
  );
}

export default CatalogFilters;
