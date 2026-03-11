/**
 * CustomersTable - Table view for customers list
 */
import {
  ClipboardDocumentIcon,
  EnvelopeIcon,
  EyeIcon,
  PhoneIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii } from "../../design-system/tokens";
import {
  AppDataTable,
  AppDataTableCell,
  AppDataTableRow,
  AppIconButton,
  SurfaceCard
} from "../ui";
import { CUSTOMER_STATUS } from "../../mock/customersMock";

function formatDate(dateString) {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function CustomerStatusBadge({ status, t }) {
  const config = {
    [CUSTOMER_STATUS.ACTIVE]: {
      label: t?.statusLabels?.active || "Faol",
      bg: uiColors.successSoft,
      color: uiColors.success
    },
    [CUSTOMER_STATUS.INACTIVE]: {
      label: t?.statusLabels?.inactive || "Faol emas",
      bg: uiColors.warningSoft,
      color: uiColors.warning
    },
    [CUSTOMER_STATUS.NEW]: {
      label: t?.statusLabels?.new || "Yangi",
      bg: uiColors.accentSoft,
      color: uiColors.accent
    }
  };

  const style = config[status] || config[CUSTOMER_STATUS.INACTIVE];

  return (
    <Badge
      bg={style.bg}
      color={style.color}
      fontWeight="600"
      fontSize="10px"
      px={2}
      py={0.5}
      borderRadius="999px"
      textTransform="uppercase"
    >
      {style.label}
    </Badge>
  );
}

export function CustomersTable({
  customers = [],
  t,
  formatPrice,
  onCopy,
  onViewDetails
}) {
  return (
    <SurfaceCard overflow="hidden" borderRadius={uiRadii.lg}>
      <Box overflowX="auto">
        <AppDataTable
          minWidth="900px"
          columns="1.5fr 1.2fr 100px 100px 120px 120px 100px 80px"
          headers={[
            t?.table?.customer || "Mijoz",
            t?.table?.contact || "Kontakt",
            t?.table?.status || "Holat",
            t?.table?.orders || "Buyurtmalar",
            t?.table?.spent || "Sarflangan",
            t?.table?.lastOrder || "Oxirgi buyurtma",
            t?.table?.groups || "Guruhlar",
            ""
          ]}
        >
          {customers.map((customer) => (
            <AppDataTableRow
              key={customer.id}
              columns="1.5fr 1.2fr 100px 100px 120px 120px 100px 80px"
              minH="64px"
              cursor="pointer"
              _hover={{ bg: uiColors.pageBg }}
              onClick={() => onViewDetails?.(customer)}
            >
              {/* Customer Name */}
              <AppDataTableCell>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600" color={uiColors.textPrimary}>
                    {customer.name}
                  </Text>
                  <Text fontSize="xs" color={uiColors.textMuted} fontFamily="mono">
                    {customer.id}
                  </Text>
                </VStack>
              </AppDataTableCell>

              {/* Contact */}
              <AppDataTableCell>
                <VStack align="start" spacing={1}>
                  {customer.phone && (
                    <HStack spacing={1.5} color={uiColors.textSecondary}>
                      <PhoneIcon width={12} />
                      <Text fontSize="sm">{customer.phone}</Text>
                    </HStack>
                  )}
                  {customer.email && (
                    <HStack spacing={1.5} color={uiColors.textMuted}>
                      <EnvelopeIcon width={12} />
                      <Text fontSize="xs" noOfLines={1}>{customer.email}</Text>
                    </HStack>
                  )}
                  {!customer.phone && !customer.email && (
                    <Text fontSize="sm" color={uiColors.textMuted}>--</Text>
                  )}
                </VStack>
              </AppDataTableCell>

              {/* Status */}
              <AppDataTableCell>
                <CustomerStatusBadge status={customer.status} t={t} />
              </AppDataTableCell>

              {/* Orders Count */}
              <AppDataTableCell>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600" color={uiColors.textPrimary}>
                    {customer.totalOrders}
                  </Text>
                  {customer.activeEsims > 0 && (
                    <Text fontSize="xs" color={uiColors.success}>
                      {customer.activeEsims} faol
                    </Text>
                  )}
                </VStack>
              </AppDataTableCell>

              {/* Total Spent */}
              <AppDataTableCell>
                <Text fontWeight="600" color={uiColors.textPrimary}>
                  {formatPrice ? formatPrice(customer.totalSpentUzs) : `${customer.totalSpentUzs?.toLocaleString()} UZS`}
                </Text>
              </AppDataTableCell>

              {/* Last Order Date */}
              <AppDataTableCell>
                <Text fontSize="sm" color={uiColors.textSecondary}>
                  {formatDate(customer.lastOrderDate)}
                </Text>
              </AppDataTableCell>

              {/* Groups */}
              <AppDataTableCell>
                {customer.groups?.length > 0 ? (
                  <HStack spacing={1} color={uiColors.textSecondary}>
                    <UserGroupIcon width={14} />
                    <Text fontSize="sm">{customer.groups.length}</Text>
                  </HStack>
                ) : (
                  <Text fontSize="sm" color={uiColors.textMuted}>--</Text>
                )}
              </AppDataTableCell>

              {/* Actions */}
              <AppDataTableCell>
                <HStack spacing={1} justify="end">
                  <AppIconButton
                    aria-label="Copy phone"
                    icon={<ClipboardDocumentIcon width={14} />}
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (customer.phone) {
                        onCopy?.(customer.phone, "Telefon");
                      }
                    }}
                    isDisabled={!customer.phone}
                  />
                  <AppIconButton
                    aria-label="View details"
                    icon={<EyeIcon width={14} />}
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(customer);
                    }}
                  />
                </HStack>
              </AppDataTableCell>
            </AppDataTableRow>
          ))}
        </AppDataTable>
      </Box>
    </SurfaceCard>
  );
}

export default CustomersTable;
