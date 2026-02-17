import { Badge, Box, Grid, GridItem, Heading, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/ui/AppButton";
import { uiColors, uiRadii } from "../design-system/tokens";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
  const { partner, profile, user, logout } = useAuth();
  const registeredDate = useMemo(() => formatDate(partner?.created_at), [partner?.created_at]);

  return (
    <VStack align="stretch" spacing={6} w="full">
      <Box>
        <Heading size="lg">Boshqaruv paneli</Heading>
        <Text mt={2} color={uiColors.textSecondary} maxW="900px">
          To gain full access to the platform, your business profile has to be approved by admins.
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
          <InfoRow label="Company Name" value={partner?.company_name} />
          <InfoRow label="Legal Name" value={partner?.legal_name} />
          <InfoRow label="INN (Tax ID)" value={partner?.tax_id} />
          <InfoRow label="Address" value={partner?.address?.raw} />
          <InfoRow label="Business Email" value={partner?.business_email} />
          <InfoRow label="Contact Person" value={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()} />
          <InfoRow label="Contact Phone" value={profile?.phone} />
          <InfoRow label="Account Email" value={user?.email} />
        </Grid>
      </Box>

      <Box>
        <AppButton variant="outline" onClick={logout} size="sm">
          Chiqish (Logout)
        </AppButton>
      </Box>
    </VStack>
  );
}

export default PendingAccountPage;
