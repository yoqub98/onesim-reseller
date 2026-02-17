import { Badge, Box, Grid, GridItem, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
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
  const { dict: t } = useLocale();
  const registeredDate = useMemo(() => formatDate(partner?.created_at), [partner?.created_at]);

  const tp = t.pending || {};
  const fields = tp.fields || {};

  return (
    <VStack align="stretch" spacing={6} w="full">
      <Box>
        <Heading size="lg">{tp.title || "Boshqaruv paneli"}</Heading>
        <HStack
          mt={3}
          p={4}
          bg="orange.50"
          borderRadius={uiRadii.md}
          borderWidth="1px"
          borderColor="orange.200"
          align="flex-start"
          spacing={3}
        >
          <Box flexShrink={0} mt="2px">
            <ExclamationTriangleIcon style={{ width: 20, height: 20, color: "#dd6b20" }} />
          </Box>
          <Text fontSize="14px" color="orange.800" lineHeight="1.6">
            {tp.description ||
              "Platformadan to'liq foydalanish uchun sizning biznes profilingiz adminlar tomonidan tasdiqlanishi kerak."}{" "}
            {tp.supportText || "Muammolar bo'lsa, qo'llab-quvvatlash xizmatimizga murojaat qiling:"}{" "}
            <Text as="span" fontWeight="700">
              {tp.supportPhone || "+998 93 514 98 08"}
            </Text>
          </Text>
        </HStack>
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
            {tp.cardTitle || "Kompaniya ro'yxatdan o'tish ma'lumotlari"}
          </Text>
          <Badge
            px={3}
            py={1}
            borderRadius="999px"
            textTransform="none"
            fontSize="12px"
            fontWeight="600"
            bg="orange.100"
            color="orange.700"
            borderWidth="1px"
            borderColor="orange.300"
          >
            {tp.badge || "Tasdiqlash kutilmoqda"}
          </Badge>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          <InfoRow label={fields.dateRegistered || "Ro'yxatdan o'tgan sana"} value={registeredDate} />
          <InfoRow label={fields.companyName || "Kompaniya nomi"} value={partner?.company_name} />
          <InfoRow label={fields.legalName || "Yuridik nomi"} value={partner?.legal_name} />
          <InfoRow label={fields.inn || "INN"} value={partner?.tax_id} />
          <InfoRow label={fields.address || "Manzil"} value={partner?.address?.raw} />
          <InfoRow label={fields.businessEmail || "Biznes email"} value={partner?.business_email} />
          <InfoRow
            label={fields.contactPerson || "Kontakt shaxs"}
            value={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()}
          />
          <InfoRow label={fields.contactPhone || "Telefon"} value={profile?.phone} />
          <InfoRow label={fields.accountEmail || "Hisob email"} value={user?.email} />
        </Grid>
      </Box>

      <Box>
        <AppButton variant="outline" onClick={logout} size="sm">
          {tp.logout || "Chiqish"}
        </AppButton>
      </Box>
    </VStack>
  );
}

export default PendingAccountPage;
