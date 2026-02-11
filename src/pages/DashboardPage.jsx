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
import { useCallback, useEffect, useMemo, useState } from "react";
import { BanknotesIcon, SignalIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import StatCard from "../components/dashboard/StatCard";
import RecentOrdersTable from "../components/dashboard/RecentOrdersTable";
import { useCurrency } from "../context/CurrencyContext";
import { ordersService } from "../services/ordersService";
import { earningsService } from "../services/earningsService";
import { formatMoneyFromUsd } from "../utils/currency";
import uz from "../i18n/uz";

function DashboardPage() {
  const { currency } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [ordersData, earningsData] = await Promise.all([
        ordersService.listOrders(),
        earningsService.getSummary()
      ]);

      setOrders(ordersData);
      setEarnings(earningsData);
    } catch (err) {
      setError(err?.message || "Dashboard yuklanmadi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeEsimsCount = useMemo(
    () => orders.filter((order) => order.status === "active").length,
    [orders]
  );

  return (
    <VStack align="stretch" spacing={6}>
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
          <Button ml="auto" size="sm" onClick={fetchData}>{uz.common.retry}</Button>
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
