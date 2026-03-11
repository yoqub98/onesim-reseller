/**
 * GroupOrderStatsCards - Stats overview for group order
 *
 * Displays:
 * - Total eSIMs
 * - Activated count
 * - Pending count
 * - Failed/Problem count
 */
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SignalIcon
} from "@heroicons/react/24/outline";
import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii } from "../../design-system/tokens";
import { SurfaceCard } from "../ui";
import { calculateGroupOrderStats } from "../../mock/groupOrdersMock";

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

export function GroupOrderStatsCards({ customers = [], t }) {
  const stats = calculateGroupOrderStats(customers);

  const cards = [
    {
      icon: SignalIcon,
      label: t?.totalEsims || "Jami eSIM",
      value: stats.total,
      color: uiColors.info,
      bgColor: uiColors.infoSoft
    },
    {
      icon: CheckCircleIcon,
      label: t?.activated || "Faollashtirilgan",
      value: stats.activated,
      color: uiColors.success,
      bgColor: uiColors.successSoft
    },
    {
      icon: ClockIcon,
      label: t?.pending || "Kutilmoqda",
      value: stats.pending,
      color: uiColors.warning,
      bgColor: uiColors.warningSoft
    },
    {
      icon: ExclamationTriangleIcon,
      label: t?.problems || "Muammo",
      value: stats.failed + stats.deliveryFailed,
      color: uiColors.error,
      bgColor: uiColors.errorSoft
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

export default GroupOrderStatsCards;
