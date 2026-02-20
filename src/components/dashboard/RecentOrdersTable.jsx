import {
  ORDER_STATUS_ACTIVE,
  ORDER_STATUS_EXPIRED,
  ORDER_STATUS_FAILED,
  ORDER_STATUS_PENDING
} from "../../constants/statuses";
import {
  Badge,
  Box,
  HStack,
  Skeleton,
  Text,
  VStack
} from "@chakra-ui/react";
import { useCurrency } from "../../context/CurrencyContext";
import { useLocale } from "../../context/LocaleContext";
import { formatMoneyFromUsd } from "../../utils/currency";
import CountryFlag from "../common/CountryFlag";

const statusColorMap = {
  [ORDER_STATUS_PENDING]: "orange",
  [ORDER_STATUS_ACTIVE]: "green",
  [ORDER_STATUS_EXPIRED]: "gray",
  [ORDER_STATUS_FAILED]: "red",
  not_activated: "purple"
};

function RecentOrdersTable({ orders = [], isLoading }) {
  const { currency, exchangeRate } = useCurrency();
  const { dict } = useLocale();
  const dashboardT = dict.dashboard;
  const statusT = dict.status;

  return (
    <Box bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.200" p={5}>
      <Text fontSize="md" fontWeight="semibold" mb={4}>{dashboardT.recentOrders}</Text>
        {isLoading ? (
          <VStack spacing={3} align="stretch">
            <Skeleton height="16px" />
            <Skeleton height="16px" />
            <Skeleton height="16px" />
          </VStack>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <Box py={8} textAlign="center">
            <Text color="gray.500">{dashboardT.noOrders}</Text>
          </Box>
        ) : null}

        {!isLoading && orders.length > 0 ? (
          <VStack align="stretch" spacing={3}>
            {orders.map((order, idx) => (
              <Box key={order.id}>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">{order.id}</Text>
                    <Badge colorScheme={statusColorMap[order.status] || "gray"}>
                      {statusT[order.status] || order.status}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.700">{order.customerName}</Text>
                    <Text color="gray.700">{formatMoneyFromUsd(order.amount, currency, exchangeRate)}</Text>
                  </HStack>
                  <HStack spacing={2} color="gray.600">
                    <CountryFlag code={order.countryCode} size={14} />
                    <Text fontSize="sm">{order.destination}</Text>
                  </HStack>
                </VStack>
                {idx < orders.length - 1 ? (
                  <Box mt={3} borderBottomWidth="1px" borderColor="gray.100" />
                ) : null}
              </Box>
            ))}
          </VStack>
        ) : null}
    </Box>
  );
}

export default RecentOrdersTable;
