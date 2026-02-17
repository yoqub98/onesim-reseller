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
import { useEffect, useMemo } from "react";
import { BanknotesIcon, SignalIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import StatCard from "../components/dashboard/StatCard";
import RecentOrdersTable from "../components/dashboard/RecentOrdersTable";
import AppToastStack from "../components/common/AppToastStack";
import { ORDER_STATUS_ACTIVE } from "../constants/statuses";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { useAppToasts } from "../hooks/useAppToasts";
import { useServiceData } from "../hooks/useServiceData";
import { ordersService } from "../services/ordersService";
import { earningsService } from "../services/earningsService";
import { formatMoneyFromUsd } from "../utils/currency";
import { useLocation, useNavigate } from "react-router-dom";

const EMPTY_LIST = [];

// Backend handoff:
// - Reads from ordersService.listOrders + earningsService.getSummary
// - See src/services/CONTRACTS.md for expected response shapes
async function loadDashboardData() {
  const [orders, earnings] = await Promise.all([
    ordersService.listOrders(),
    earningsService.getSummary()
  ]);
  return { orders, earnings };
}

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const { dict } = useLocale();
  const { toasts, pushToast } = useAppToasts();
  const dashboardT = dict.dashboard;
  const pendingT = dict.pending || {};
  const commonT = dict.common;
  const {
    data: dashboardData,
    loading: isLoading,
    error: loadError,
    refetch
  } = useServiceData(loadDashboardData);
  const orders = dashboardData?.orders || EMPTY_LIST;
  const earnings = dashboardData?.earnings || null;
  const error = loadError ? (loadError.message || commonT.loading) : "";

  const activeEsimsCount = useMemo(
    () => orders.filter((order) => order.status === ORDER_STATUS_ACTIVE).length,
    [orders]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const approved = params.get("approved") === "1";

    if (approved) {
      pushToast({
        type: "success",
        title: pendingT.approvedTitle || "Sizning akkauntingiz tasdiqlandi",
        description: pendingT.approvedDescription || "Admin hisobingizni faollashtirdi. Endi platformadan to'liq foydalanishingiz mumkin.",
        duration: 3800,
      });

      navigate("/", { replace: true });
    }
  }, [
    location.search,
    navigate,
    pendingT.approvedDescription,
    pendingT.approvedTitle,
    pushToast,
  ]);

  return (
    <VStack align="stretch" spacing={8} w="full">
      <AppToastStack items={toasts} />
      <Box>
        <Heading size="lg">{dashboardT.title}</Heading>
        <Text color="gray.600" mt={1}>{dashboardT.subtitle}</Text>
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
          <Button ml="auto" size="sm" onClick={refetch}>{commonT.retry}</Button>
        </Box>
      ) : null}

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <GridItem>
          {isLoading ? (
            <Skeleton h="124px" borderRadius="xl" />
          ) : (
            <StatCard
              label={dashboardT.stats.totalOrders}
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
              label={dashboardT.stats.activeEsims}
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
              label={dashboardT.stats.totalEarnings}
              value={formatMoneyFromUsd(earnings?.totalCommission ?? 0, currency)}
              helper={`${earnings?.monthlyGrowthPct ?? 0}%`}
              icon={<BanknotesIcon width={22} color="#FE4F18" />}
            />
          )}
        </GridItem>
      </Grid>

      <Box bg="white" p={6} borderRadius="xl" borderWidth="1px" borderColor="gray.200" minH="180px">
        <Heading size="sm" mb={4}>{dashboardT.chartTitle}</Heading>
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
            {dashboardT.chartPlaceholder}
          </Box>
        )}
      </Box>

      <RecentOrdersTable orders={orders.slice(0, 5)} isLoading={isLoading} />
    </VStack>
  );
}

export default DashboardPage;
