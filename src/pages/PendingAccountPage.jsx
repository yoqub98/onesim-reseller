import { Badge, Box, Grid, GridItem, Heading, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { uiColors, uiRadii } from "../design-system/tokens";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function InfoRow({ label, value }) {
  return (
    <GridItem>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.06em" color={uiColors.textMuted}>
        {label}
      </Text>
      <Text mt={1} fontSize="sm" color={uiColors.textPrimary}>
        {value || "-"}
      </Text>
    </GridItem>
  );
}

function PendingAccountPage() {
  const { user } = useAuth();
  const registeredDate = useMemo(() => formatDate(user?.registered_at), [user?.registered_at]);

  return (
    <VStack align="stretch" spacing={6} w="full">
      <Box>
        <Heading size="lg">Boshqaruv paneli</Heading>
        <Text mt={2} color={uiColors.textSecondary} maxW="900px">
          To gain full access to platform, your business profile has to be approved by admins of the platform.
          Admins were notified of your signup and will be reviewing your profile very shortly. Thank you for understanding.
          For any issues, please contact +998 93 514 98 08 for our support team.
        </Text>
      </Box>

      <Box
        bg="white"
        borderWidth="1px"
        borderColor={uiColors.border}
        borderRadius={uiRadii.md}
        p={{ base: 4, md: 6 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
          <Text fontSize="md" fontWeight="700" color={uiColors.textPrimary}>
            Company Registration Details
          </Text>
          <Badge colorScheme="orange" borderRadius="999px" px={3} py={1} textTransform="none">
            Pending for approval
          </Badge>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          <InfoRow label="Date Registered" value={registeredDate} />
          <InfoRow label="Company Name" value={user?.company_name} />
          <InfoRow label="Legal Name" value={user?.legal_name} />
          <InfoRow label="INN" value={user?.inn} />
          <InfoRow label="Address" value={user?.address} />
          <InfoRow label="Contact Full Name" value={user?.contact_full_name} />
          <InfoRow label="Contact Phone" value={user?.contact_phone} />
          <InfoRow label="Email" value={user?.email} />
        </Grid>
      </Box>
    </VStack>
  );
}

export default PendingAccountPage;
