/**
 * GroupOrderCustomersTable - Customer list with eSIM details
 *
 * Features:
 * - Search by name, phone, email, ICCID
 * - Filter by eSIM status
 * - Expandable rows with QR code and actions
 * - Per-customer actions: resend, view details, copy link
 */
import {
  ChevronDownIcon,
  ClipboardDocumentIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { uiColors, uiRadii } from "../../design-system/tokens";
import {
  AppButton,
  AppDataTable,
  AppDataTableCell,
  AppDataTableRow,
  AppIconButton,
  AppInput,
  AppSelect,
  SurfaceCard,
  EsimStatusBadge,
  DataUsageBar,
  QrCodeDisplay,
  InstallLinksButtons
} from "../ui";
import { ESIM_STATUS, DELIVERY_STATUS } from "../../mock/groupOrdersMock";

const DELIVERY_ICONS = {
  sms: DevicePhoneMobileIcon,
  email: EnvelopeIcon,
  manual: PrinterIcon
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Barchasi" },
  { value: "active", label: "Faol" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "problem", label: "Muammo" }
];

function DeliveryStatusBadge({ status, t }) {
  const config = {
    [DELIVERY_STATUS.PENDING]: { label: t?.pending || "Kutilmoqda", bg: uiColors.warningSoft, color: uiColors.warning },
    [DELIVERY_STATUS.SENT]: { label: t?.sent || "Yuborilgan", bg: uiColors.infoSoft, color: uiColors.info },
    [DELIVERY_STATUS.DELIVERED]: { label: t?.delivered || "Yetkazilgan", bg: uiColors.successSoft, color: uiColors.success },
    [DELIVERY_STATUS.FAILED]: { label: t?.failed || "Xatolik", bg: uiColors.errorSoft, color: uiColors.error },
    [DELIVERY_STATUS.BOUNCED]: { label: t?.bounced || "Qaytarilgan", bg: uiColors.errorSoft, color: uiColors.error }
  };

  const style = config[status] || config[DELIVERY_STATUS.PENDING];

  return (
    <Box
      display="inline-flex"
      px={2}
      py={0.5}
      borderRadius="999px"
      bg={style.bg}
      color={style.color}
      fontSize="10px"
      fontWeight="600"
      textTransform="uppercase"
    >
      {style.label}
    </Box>
  );
}

function ExpandedCustomerRow({ customer, onCopy, onResend, onViewDetails, t }) {
  const installLinks = {
    ios: `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${customer.activationCode}`,
    android: `https://esim.onesim.uz/install?iccid=${customer.iccid}`,
    manual: customer.activationCode
  };

  return (
    <Box
      p={4}
      bg={uiColors.surfaceSoft}
      borderTopWidth="1px"
      borderColor={uiColors.border}
    >
      <HStack spacing={6} align="start" flexWrap="wrap">
        {/* QR Code */}
        <Box>
          <QrCodeDisplay
            qrCodeUrl={customer.qrCodeUrl}
            activationCode={customer.activationCode}
            iccid={customer.iccid}
            size="sm"
            showActions={false}
            onCopy={onCopy}
          />
        </Box>

        {/* Details */}
        <VStack align="start" spacing={3} flex={1} minW="200px">
          <Box>
            <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="600">
              ICCID
            </Text>
            <HStack spacing={2}>
              <Text fontSize="sm" fontFamily="mono" color={uiColors.textPrimary}>
                {customer.iccid}
              </Text>
              <AppIconButton
                aria-label="Copy ICCID"
                icon={<ClipboardDocumentIcon width={14} />}
                variant="ghost"
                size="xs"
                onClick={() => onCopy?.(customer.iccid, "ICCID")}
              />
            </HStack>
          </Box>

          <InstallLinksButtons
            iosLink={installLinks.ios}
            androidLink={installLinks.android}
            manualCode={installLinks.manual}
            onCopy={onCopy}
            size="sm"
          />
        </VStack>

        {/* Actions */}
        <VStack align="end" spacing={2}>
          <AppButton
            variant="outline"
            size="sm"
            leftIcon={<ArrowPathIcon width={14} />}
            onClick={() => onResend?.(customer)}
            isDisabled={customer.deliveryMethod === "manual"}
          >
            {t?.resend || "Qayta yuborish"}
          </AppButton>
          <AppButton
            variant="soft"
            size="sm"
            onClick={() => onViewDetails?.(customer)}
          >
            {t?.viewDetails || "Batafsil"}
          </AppButton>
        </VStack>
      </HStack>
    </Box>
  );
}

export function GroupOrderCustomersTable({
  customers = [],
  t,
  onCopy,
  onResend,
  onViewDetails
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchable = [
          customer.name,
          customer.phone,
          customer.email,
          customer.iccid
        ].map((v) => String(v || "").toLowerCase());

        if (!searchable.some((v) => v.includes(query))) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "active") {
          return customer.esimStatus === ESIM_STATUS.IN_USE;
        }
        if (statusFilter === "pending") {
          return customer.esimStatus === ESIM_STATUS.NOT_ACTIVE;
        }
        if (statusFilter === "problem") {
          return (
            customer.esimStatus === ESIM_STATUS.FAILED ||
            customer.esimStatus === ESIM_STATUS.CANCELLED ||
            customer.deliveryStatus === DELIVERY_STATUS.FAILED
          );
        }
      }

      return true;
    });
  }, [customers, searchQuery, statusFilter]);

  const toggleRow = (customerId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  };

  return (
    <VStack align="stretch" spacing={4}>
      {/* Filters */}
      <HStack spacing={3} flexWrap="wrap">
        <Box flex={1} minW="240px" maxW="400px">
          <AppInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t?.searchPlaceholder || "Qidirish: ism, telefon, email, ICCID"}
            leftElement={<MagnifyingGlassIcon width={16} />}
          />
        </Box>
        <Box w="160px">
          <AppSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_FILTER_OPTIONS}
          />
        </Box>
        <Text fontSize="sm" color={uiColors.textSecondary}>
          {filteredCustomers.length} / {customers.length} {t?.customers || "mijoz"}
        </Text>
      </HStack>

      {/* Table */}
      <SurfaceCard overflow="hidden" borderRadius={uiRadii.lg}>
        {filteredCustomers.length === 0 ? (
          <Box py={12} textAlign="center">
            <Text color={uiColors.textSecondary}>
              {t?.noResults || "Mijozlar topilmadi"}
            </Text>
          </Box>
        ) : (
          <Box overflowX="auto">
            <AppDataTable
              minWidth="900px"
              columns="40px 1.5fr 1.2fr 1fr 1fr 1.2fr 1.3fr"
              headers={[
                "",
                t?.customer || "Mijoz",
                t?.contact || "Kontakt",
                t?.delivery || "Yetkazish",
                t?.esimStatus || "eSIM holati",
                t?.dataUsage || "Data ishlatilgan",
                ""
              ]}
            >
              {filteredCustomers.map((customer) => {
                const isExpanded = expandedRows.has(customer.id);
                const DeliveryIcon = DELIVERY_ICONS[customer.deliveryMethod];

                return (
                  <Box key={customer.id}>
                    <AppDataTableRow
                      columns="40px 1.5fr 1.2fr 1fr 1fr 1.2fr 1.3fr"
                      minH="64px"
                      cursor="pointer"
                      _hover={{ bg: uiColors.pageBg }}
                      onClick={() => toggleRow(customer.id)}
                    >
                      <AppDataTableCell>
                        <Box
                          transform={isExpanded ? "rotate(180deg)" : "rotate(0deg)"}
                          transition="transform 0.2s ease"
                          color={uiColors.textMuted}
                        >
                          <ChevronDownIcon width={16} />
                        </Box>
                      </AppDataTableCell>

                      <AppDataTableCell>
                        <Text fontWeight="600" color={uiColors.textPrimary}>
                          {customer.name}
                        </Text>
                      </AppDataTableCell>

                      <AppDataTableCell>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color={uiColors.textSecondary}>
                            {customer.phone || "--"}
                          </Text>
                          <Text fontSize="xs" color={uiColors.textMuted}>
                            {customer.email || "--"}
                          </Text>
                        </VStack>
                      </AppDataTableCell>

                      <AppDataTableCell>
                        <VStack align="start" spacing={1}>
                          <HStack spacing={1.5} color={uiColors.textSecondary}>
                            {DeliveryIcon && <DeliveryIcon width={14} />}
                            <Text fontSize="xs" textTransform="capitalize">
                              {customer.deliveryMethod}
                            </Text>
                          </HStack>
                          <DeliveryStatusBadge status={customer.deliveryStatus} t={t?.deliveryStatuses} />
                        </VStack>
                      </AppDataTableCell>

                      <AppDataTableCell>
                        <EsimStatusBadge status={customer.esimStatus} size="sm" />
                      </AppDataTableCell>

                      <AppDataTableCell>
                        <DataUsageBar
                          usedGb={customer.dataUsedGb}
                          totalGb={customer.dataTotalGb}
                          size="sm"
                          variant="compact"
                        />
                      </AppDataTableCell>

                      <AppDataTableCell>
                        <HStack spacing={1} justify="end">
                          <AppIconButton
                            aria-label="Copy ICCID"
                            icon={<ClipboardDocumentIcon width={14} />}
                            variant="ghost"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopy?.(customer.iccid, "ICCID");
                            }}
                          />
                          <AppIconButton
                            aria-label="Print QR"
                            icon={<PrinterIcon width={14} />}
                            variant="ghost"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Will trigger print in expanded row
                              if (!isExpanded) toggleRow(customer.id);
                            }}
                          />
                        </HStack>
                      </AppDataTableCell>
                    </AppDataTableRow>

                    {isExpanded && (
                      <ExpandedCustomerRow
                        customer={customer}
                        onCopy={onCopy}
                        onResend={onResend}
                        onViewDetails={onViewDetails}
                        t={t}
                      />
                    )}
                  </Box>
                );
              })}
            </AppDataTable>
          </Box>
        )}
      </SurfaceCard>
    </VStack>
  );
}

export default GroupOrderCustomersTable;
