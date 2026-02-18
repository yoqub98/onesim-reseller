// Renders the catalog filter controls — used in CatalogPage
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Box, Grid, HStack, Text } from "@chakra-ui/react";
import { AppCombobox, AppMultiSelect, AppSelect, SurfaceCard } from "../ui";
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
  return (
    <SurfaceCard p={{ base: 4, md: 5 }}>
      <HStack mb={3} spacing={2} color={uiColors.textPrimary}>
        <FunnelIcon width={16} />
        <Text fontWeight="600">{t.filtersTitle}</Text>
      </HStack>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr 1fr" }} gap={3}>
        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {t.filters.destination}
          </Text>
          <AppCombobox
            value={filters.destination}
            options={destinationOptions}
            onChange={(value) => onChange({ destination: value })}
            placeholder={t.filters.search}
            allLabel={t.units.all}
          />
        </Box>

        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {t.filters.locationType}
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
            {t.filters.packageType}
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

        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {t.filters.gb}
          </Text>
          <AppMultiSelect
            value={filters.data}
            options={dataFilterOptions}
            onChange={(values) => onChange({ data: values })}
            allLabel={t.units.all}
          />
        </Box>

        <Box>
          <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
            {t.filters.days}
          </Text>
          <AppMultiSelect
            value={filters.days}
            options={dayFilterOptions}
            onChange={(values) => onChange({ days: values })}
            allLabel={t.units.all}
          />
        </Box>
      </Grid>
    </SurfaceCard>
  );
}

export default CatalogFilters;
