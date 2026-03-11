/**
 * CustomersStatsCards - Stats overview for customers
 */
import {
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii } from "../../design-system/tokens";
import { SurfaceCard } from "../ui";
import { calculateCustomerStats } from "../../mock/customersMock";

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <SurfaceCard p={4} borderRadius={uiRadii.md}>
      <HStack spacing={4}>
        <Box
          p={2.5}
          borderRadius={uiRadii.sm}
          bg={bgColor}
          color={color}
        >
          <Icon width={24} strokeWidth={2} />
        </Box>
        <VStack align="start" spacing={0}>
          <Text fontSize="2xl" fontWeight="800" color={uiColors.textPrimary} lineHeight="1">
            {value}
          </Text>
          <Text fontSize="sm" color={uiColors.textSecondary} fontWeight="500">
            {label}
          </Text>
        </VStack>
      </HStack>
    </SurfaceCard>
  );
}

export function CustomersStatsCards({ customers = [], t, formatPrice }) {
  const stats = calculateCustomerStats(customers);

  const cards = [
    {
      icon: UsersIcon,
      label: t?.stats?.total || "Jami mijozlar",
      value: stats.total,
      color: uiColors.info,
      bgColor: uiColors.infoSoft
    },
    {
      icon: CheckCircleIcon,
      label: t?.stats?.active || "Faol",
      value: stats.active,
      color: uiColors.success,
      bgColor: uiColors.successSoft
    },
    {
      icon: ClockIcon,
      label: t?.stats?.inactive || "Faol emas",
      value: stats.inactive,
      color: uiColors.warning,
      bgColor: uiColors.warningSoft
    },
    {
      icon: SparklesIcon,
      label: t?.stats?.newCustomers || "Yangi",
      value: stats.newCustomers,
      color: uiColors.accent,
      bgColor: uiColors.accentSoft
    }
  ];

  return (
    <Grid
      templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
      gap={4}
    >
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </Grid>
  );
}

export default CustomersStatsCards;
