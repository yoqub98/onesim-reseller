// Renders order identity summary with status, customer, and dates — used in OrderDetailsPage
import { Box, Heading, HStack, Text } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function OrderInfoSummaryCard({ order, detail, statusText }) {
  const activatedAtText = order.timeline?.activatedAt ? `${formatDateTime(order.timeline.activatedAt)} activated` : "";

  return (
    <HStack justify="space-between" align={{ base: "start", md: "center" }} flexWrap="wrap" gap={2}>
      <Box>
        <Heading color={uiColors.textPrimary} fontSize={{ base: "32px", md: "40px" }} fontWeight="800" lineHeight="1.1">
          {detail.orderTitle} #{order.id}
        </Heading>
        {order.customerName ? (
          <Text mt={1} color={uiColors.textSecondary}>
            {detail.customer}: <Text as="span" color={uiColors.textPrimary} fontWeight="500">{order.customerName}</Text>
          </Text>
        ) : null}
      </Box>
      <HStack spacing={2}>
        <Box as="span" px={3} py={1} borderRadius="full" bg="#00c950" color="white" fontWeight="600" fontSize="sm">
          {statusText}
        </Box>
        <Text color={uiColors.textSecondary} fontSize="xs">{activatedAtText}</Text>
      </HStack>
    </HStack>
  );
}

export default OrderInfoSummaryCard;
