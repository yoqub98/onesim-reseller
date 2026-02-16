// Renders the orders data table with per-tab row schema — used in OrdersPage
import { ArrowRightIcon, BoltIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { Box, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import {
  AppDataTable,
  AppDataTableCell,
  AppDataTableRow,
  AppIconButton,
  PackageDisplay,
  SurfaceCard
} from "../ui";
import { uiColors } from "../../design-system/tokens";
import { formatMoneyFromUzs } from "../../utils/currency";
import { formatPackageDataLabel } from "../../utils/package";
import StatusPill from "./StatusPill";

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatUsage(used, total) {
  if (total === 999) {
    return `${Number(used || 0).toFixed(1)} / INFINITY GB`;
  }

  return `${Number(used || 0).toFixed(1)} / ${Number(total || 0)} GB`;
}

function calcCommission(paymentTotalUzs) {
  return Math.round((Number(paymentTotalUzs || 0) * 0.05) / 50) * 50;
}

function OrdersTable({
  t,
  activeTab,
  rows,
  isLoading,
  error,
  currency,
  statusLabels,
  onRowClick,
  onQuickAction
}) {
  const isClientTab = activeTab === "client";

  return (
    <>
      {error ? (
        <SurfaceCard p={4} borderColor="#fecaca" bg="#fff1f2">
          <Text color="#991b1b" fontSize="sm">{error}</Text>
        </SurfaceCard>
      ) : null}

      <SurfaceCard overflow="hidden" borderRadius="14px">
        {isLoading ? (
          <VStack align="stretch" p={4} spacing={3}>
            {[1, 2, 3, 4].map((idx) => <Skeleton key={idx} h="64px" borderRadius="md" />)}
          </VStack>
        ) : null}

        {!isLoading && rows.length === 0 ? (
          <Box py={14} textAlign="center">
            <Text color={uiColors.textSecondary}>{t.empty}</Text>
          </Box>
        ) : null}

        {!isLoading && rows.length > 0 ? (
          <AppDataTable
            minWidth={isClientTab ? "1320px" : activeTab === "self" ? "980px" : "1080px"}
            columns={
              isClientTab
                ? "1.2fr 2fr 1.9fr 1.1fr 1fr 1fr 1.2fr 1.3fr 1.3fr 1.1fr"
                : activeTab === "group"
                  ? "1.2fr 1.8fr 2fr 1fr 1fr 1.2fr 1.3fr 1.1fr"
                  : "1.2fr 2fr 1.6fr 1fr 1.2fr 1.3fr 1.1fr"
            }
            headers={
              isClientTab
                ? [
                    t.table.id,
                    t.table.customer,
                    t.table.package,
                    { label: t.table.count, align: "center" },
                    { label: "Muddati", align: "center" },
                    { label: t.table.date, align: "center" },
                    { label: t.table.status, align: "center" },
                    { label: t.table.amount, align: "right" },
                    { label: "Komissiya", align: "right" },
                    { label: t.table.actions, align: "center" }
                  ]
                : activeTab === "group"
                  ? [
                      t.table.id,
                      t.table.group,
                      t.table.package,
                      { label: t.table.count, align: "center" },
                      { label: t.table.date, align: "center" },
                      { label: t.table.status, align: "center" },
                      { label: t.table.amount, align: "right" },
                      { label: t.table.actions, align: "center" }
                    ]
                  : [
                      t.table.id,
                      t.table.package,
                      { label: t.table.usage, align: "center" },
                      { label: t.table.date, align: "center" },
                      { label: t.table.status, align: "center" },
                      { label: t.table.amount, align: "right" },
                      { label: t.table.actions, align: "center" }
                    ]
            }
          >
            {rows.map((row) => (
              <AppDataTableRow
                key={row.id}
                columns={
                  isClientTab
                    ? "1.2fr 2fr 1.9fr 1.1fr 1fr 1fr 1.2fr 1.3fr 1.3fr 1.1fr"
                    : activeTab === "group"
                      ? "1.2fr 1.8fr 2fr 1fr 1fr 1.2fr 1.3fr 1.1fr"
                      : "1.2fr 2fr 1.6fr 1fr 1.2fr 1.3fr 1.1fr"
                }
                minH={isClientTab ? "74px" : "70px"}
                cursor="pointer"
                transition="background 0.15s ease"
                _hover={{ bg: uiColors.pageBg }}
                onClick={() => onRowClick(row)}
              >
                <AppDataTableCell>
                  <Text color={uiColors.textSecondary} fontSize="sm">{row.id}</Text>
                </AppDataTableCell>

                {activeTab === "client" ? (
                  <AppDataTableCell>
                    <Text fontWeight="600" color={uiColors.textPrimary}>{row.customerName || "-"}</Text>
                    <Text fontSize="xs" color={uiColors.textSecondary}>{row.customerPhone || row.customerEmail || "-"}</Text>
                  </AppDataTableCell>
                ) : null}

                {activeTab === "group" ? (
                  <AppDataTableCell>
                    <Text fontWeight="600" color={uiColors.textPrimary}>{row.groupName || "-"}</Text>
                  </AppDataTableCell>
                ) : null}

                <AppDataTableCell>
                  <PackageDisplay
                    countryCode={row.package?.countryCode}
                    destination={row.package?.destination || row.package?.name}
                    dataLabel={formatPackageDataLabel(row.package)}
                    flagSize={28}
                    titleSize="sm"
                    subtitleSize="xs"
                  />
                </AppDataTableCell>

                <AppDataTableCell align="center">
                  {activeTab === "group" ? (
                    <Text color={uiColors.textSecondary} fontWeight="500">{row.groupMembers?.length || 0}</Text>
                  ) : activeTab === "self" ? (
                    <Text color={uiColors.textSecondary} fontSize="sm">{formatUsage(row.dataUsageGb, row.totalDataGb)}</Text>
                  ) : (
                    <Text color={uiColors.textSecondary} fontWeight="500">{formatPackageDataLabel(row.package)}</Text>
                  )}
                </AppDataTableCell>

                {activeTab !== "self" ? (
                  <AppDataTableCell align="center">
                    <Text color={uiColors.textSecondary} fontSize="sm">
                      {activeTab === "client" ? `${row.package?.validityDays || 0} kun` : formatDate(row.purchasedAt)}
                    </Text>
                  </AppDataTableCell>
                ) : null}

                <AppDataTableCell align="center">
                  <Text color={uiColors.textSecondary} fontSize="sm">{formatDate(row.purchasedAt)}</Text>
                </AppDataTableCell>

                <AppDataTableCell align="center">
                  <StatusPill value={row.status} labels={statusLabels} />
                </AppDataTableCell>

                <AppDataTableCell align="right">
                  <Text color={uiColors.textPrimary} fontWeight="600">
                    {formatMoneyFromUzs(row.paymentTotalUzs || 0, currency)}
                  </Text>
                </AppDataTableCell>

                {isClientTab ? (
                  <AppDataTableCell align="right">
                    <Text color="#00a63e" fontWeight="600">
                      + {formatMoneyFromUzs(calcCommission(row.paymentTotalUzs), currency)}
                    </Text>
                  </AppDataTableCell>
                ) : null}

                <AppDataTableCell align="center">
                  {isClientTab ? (
                    <HStack spacing={1} justify="center">
                      <AppIconButton
                        aria-label="Quick action"
                        variant="ghost"
                        size="xs"
                        icon={<BoltIcon width={14} />}
                        onClick={(event) => {
                          event.stopPropagation();
                          onQuickAction(row);
                        }}
                      />
                      <AppIconButton
                        aria-label={t.actions.openDetails}
                        variant="ghost"
                        size="xs"
                        icon={<ArrowRightIcon width={14} />}
                        onClick={(event) => {
                          event.stopPropagation();
                          onRowClick(row);
                        }}
                      />
                    </HStack>
                  ) : (
                    <AppIconButton
                      aria-label={activeTab === "client" ? t.actions.openDetails : t.actions.openModal}
                      icon={<ClipboardDocumentIcon width={16} />}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRowClick(row);
                      }}
                    />
                  )}
                </AppDataTableCell>
              </AppDataTableRow>
            ))}
          </AppDataTable>
        ) : null}
      </SurfaceCard>
    </>
  );
}

export default OrdersTable;
