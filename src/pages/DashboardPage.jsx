import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Skeleton,
  Text,
  VStack
} from "@chakra-ui/react";
import { useMemo } from "react";
import { BanknotesIcon, SignalIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import StatCard from "../components/dashboard/StatCard";
import RecentOrdersTable from "../components/dashboard/RecentOrdersTable";
import { ORDER_STATUS_ACTIVE } from "../constants/statuses";
import { useCurrency } from "../context/CurrencyContext";
import { useServiceData } from "../hooks/useServiceData";
import { ordersService } from "../services/ordersService";
import { earningsService } from "../services/earningsService";
import { formatMoneyFromUsd } from "../utils/currency";
import uz from "../i18n/uz";

const EMPTY_LIST = [];

async function loadDashboardData() {
  const [orders, earnings] = await Promise.all([
    ordersService.listOrders(),
    earningsService.getSummary()
  ]);
  return { orders, earnings };
}

function DashboardPage() {
  const { currency } = useCurrency();
  const {
    data: dashboardData,
    loading: isLoading,
    error: loadError,
    refetch
  } = useServiceData(loadDashboardData);
  const orders = dashboardData?.orders || EMPTY_LIST;
  const earnings = dashboardData?.earnings || null;
  const error = loadError ? (loadError.message || "Dashboard yuklanmadi") : "";

  const activeEsimsCount = useMemo(
    () => orders.filter((order) => order.status === ORDER_STATUS_ACTIVE).length,
    [orders]
  );

  return (
    <VStack align="stretch" spacing={8} maxW="1320px" mx="auto">
      <Box>
        <Heading size="lg">{uz.dashboard.title}</Heading>
        <Text color="gray.600" mt={1}>{uz.dashboard.subtitle}</Text>
      </Box>

      {error ? (
        <Box
          borderRadius="lg"
          borderWidth="1px"
          borderColor="red.200"
          bg="red.50"
          p={3}
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Text color="red.700" fontSize="sm">{error}</Text>
          <Button ml="auto" size="sm" onClick={refetch}>{uz.common.retry}</Button>
        </Box>
      ) : null}

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <GridItem>
          {isLoading ? (
            <Skeleton h="124px" borderRadius="xl" />
          ) : (
            <StatCard
              label={uz.dashboard.stats.totalOrders}
              value={earnings?.totalOrders ?? orders.length}
              icon={<ShoppingCartIcon width={22} color="#FE4F18" />}
            />
          )}
        </GridItem>
        <GridItem>
          {isLoading ? (
            <Skeleton h="124px" borderRadius="xl" />
          ) : (
            <StatCard
              label={uz.dashboard.stats.activeEsims}
              value={earnings?.activeEsims ?? activeEsimsCount}
              icon={<SignalIcon width={22} color="#FE4F18" />}
            />
          )}
        </GridItem>
        <GridItem>
          {isLoading ? (
            <Skeleton h="124px" borderRadius="xl" />
          ) : (
            <StatCard
              label={uz.dashboard.stats.totalEarnings}
              value={formatMoneyFromUsd(earnings?.totalCommission ?? 0, currency)}
              helper={`${earnings?.monthlyGrowthPct ?? 0}% oyma-oy o'sish`}
              icon={<BanknotesIcon width={22} color="#FE4F18" />}
            />
          )}
        </GridItem>
      </Grid>

      <Box bg="white" p={6} borderRadius="xl" borderWidth="1px" borderColor="gray.200" minH="180px">
        <Heading size="sm" mb={4}>{uz.dashboard.chartTitle}</Heading>
        {isLoading ? (
          <Skeleton h="90px" />
        ) : (
          <Box
            h="90px"
            borderRadius="lg"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="gray.300"
            display="grid"
            placeItems="center"
            color="gray.500"
          >
            {uz.dashboard.chartPlaceholder}
          </Box>
        )}
      </Box>

      <RecentOrdersTable orders={orders.slice(0, 5)} isLoading={isLoading} />
    </VStack>
  );
}

export default DashboardPage;
