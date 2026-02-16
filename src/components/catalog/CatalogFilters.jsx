// Renders the destination and package filter controls — used in CatalogPage
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Box, Grid, HStack, Text } from "@chakra-ui/react";
import { AppSelect, FilterChips, SurfaceCard } from "../ui";
import { uiColors } from "../../design-system/tokens";

function CatalogFilters({ t, filters, destinationOptions, dataFilterOptions, dayFilterOptions, onChange }) {
  return (
    <SurfaceCard p={{ base: 4, md: 5 }}>
      <HStack mb={3} spacing={2} color={uiColors.textPrimary}>
        <FunnelIcon width={16} />
        <Text fontWeight="600">{t.filtersTitle}</Text>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "240px 1fr 1fr" }} gap={4}>
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
