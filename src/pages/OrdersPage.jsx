import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { Box, HStack, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import PlaceholderPage from "../components/common/PlaceholderPage";
import uz from "../i18n/uz";

function OrdersPage() {
  const location = useLocation();
  const createdOrderId = location.state?.createdOrderId;

  return (
    <>
      {createdOrderId ? (
        <Box bg="green.50" borderWidth="1px" borderColor="green.200" borderRadius="lg" p={3} mb={4}>
          <HStack spacing={2}>
            <CheckBadgeIcon width={18} color="#16A34A" />
            <Text color="green.800" fontSize="sm">Yangi buyurtma yaratildi: {createdOrderId}</Text>
          </HStack>
        </Box>
      ) : null}
      <PlaceholderPage title={uz.nav.orders} message={uz.common.placeholder} />
    </>
  );
}

export default OrdersPage;
