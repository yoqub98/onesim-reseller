// Renders the order status badge across orders views — used in OrdersTable and OrderActionModals
import { Box } from "@chakra-ui/react";
import {
  ORDER_STATUS_ACTIVE,
  ORDER_STATUS_EXPIRED,
  ORDER_STATUS_FAILED,
  ORDER_STATUS_PENDING
} from "../../constants/statuses";

const statusColor = {
  [ORDER_STATUS_ACTIVE]: { bg: "#dff3eb", text: "#118f5e", border: "#9cd8bf" },
  [ORDER_STATUS_PENDING]: { bg: "#fff0e8", text: "#a65f00", border: "#ffb085" },
  [ORDER_STATUS_FAILED]: { bg: "#fee2e2", text: "#be123c", border: "#fecaca" },
  [ORDER_STATUS_EXPIRED]: { bg: "#f1f5f9", text: "#67778e", border: "#d9e2ec" }
};

function StatusPill({ value, labels }) {
  const visual = statusColor[value] || statusColor[ORDER_STATUS_EXPIRED];
  const text = labels[value] || value;

  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px={3}
      py={1}
      minW="118px"
      borderRadius="full"
      borderWidth="1px"
      borderColor={visual.border}
      bg={visual.bg}
      color={visual.text}
      fontSize="xs"
      fontWeight="600"
      textTransform="capitalize"
      letterSpacing="-0.2px"
    >
      {text}
    </Box>
  );
}

export default StatusPill;
