import {
  ArrowPathIcon,
  ArrowRightIcon,
  BoltIcon,
  ClipboardDocumentIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UsersIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";
import {
  Badge,
  Box,
  Grid,
  Heading,
  HStack,
  Input,
  Skeleton,
  Table,
  Text,
  VStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppToastStack from "../components/common/AppToastStack";
import {
  AppButton,
  AppDataTable,
  AppDataTableCell,
  AppDataTableRow,
  AppIconButton,
  PackageDisplay,
  SegmentedControl,
  SurfaceCard
} from "../components/ui";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { uiColors } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";
import uz from "../i18n/uz";
import { ordersService } from "../services/ordersService";
import { formatMoneyFromUzs } from "../utils/currency";
import { formatPackageDataLabel } from "../utils/package";

const statusColor = {
  active: { bg: "#dff3eb", text: "#118f5e", border: "#9cd8bf" },
  pending: { bg: "#fff0e8", text: "#a65f00", border: "#ffb085" },
  failed: { bg: "#fee2e2", text: "#be123c", border: "#fecaca" },
  expired: { bg: "#f1f5f9", text: "#67778e", border: "#d9e2ec" }
};

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

function StatusPill({ value, labels }) {
  const visual = statusColor[value] || statusColor.expired;
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

function modalBackdrop(onClose) {
  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(15, 23, 43, 0.48)"
      backdropFilter="blur(2px)"
      zIndex={40}
      onClick={onClose}
    />
  );
}

function MyselfOrderModal({ order, t, statusLabels, onClose, onCopy }) {
  if (!order) {
    return null;
  }

  const qrData = `LPA:1$esim.onesim.uz$${order.iccid}`;

  return (
    <>
      {modalBackdrop(onClose)}
      <Box position="fixed" inset={0} zIndex={50} display="grid" placeItems="center" p={4}>
        <SurfaceCard w="full" maxW="520px" overflow="hidden" borderRadius="14px">
          <HStack px={5} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <Heading fontSize="lg" color={uiColors.textPrimary}>{t.title}</Heading>
            <AppIconButton
              aria-label={t.close}
              icon={<XMarkIcon width={18} />}
              variant="ghost"
              onClick={onClose}
            />
          </HStack>
          <VStack spacing={5} align="stretch" p={5}>
            <VStack spacing={3}>
              <Box p={3} borderWidth="1px" borderColor={uiColors.border} borderRadius="14px" bg="white">
                <Box
                  as="img"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`}
                  alt={t.qrAlt}
                  w="160px"
                  h="160px"
                />
              </Box>
              <Text fontSize="sm" color={uiColors.textSecondary} textAlign="center">
                {t.helper}
              </Text>
            </VStack>

            <SurfaceCard p={3} borderRadius="10px">
              <HStack justify="space-between" align="start">
                <Box>
                  <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                    {t.iccid}
                  </Text>
                  <Text mt={1} fontFamily="mono" color={uiColors.textPrimary}>{order.iccid}</Text>
                </Box>
                <AppIconButton
                  aria-label={t.copy}
                  icon={<ClipboardDocumentIcon width={16} />}
                  onClick={() => onCopy(order.iccid, t.iccid)}
                />
              </HStack>
            </SurfaceCard>

            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
              <SurfaceCard p={3} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                  {t.status}
                </Text>
                <Box mt={2}>
                  <StatusPill value={order.status} labels={statusLabels} />
                </Box>
              </SurfaceCard>
              <SurfaceCard p={3} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                  {t.traffic}
                </Text>
                <Text mt={2} color={uiColors.textPrimary} fontWeight="600">
                  {formatUsage(order.dataUsageGb, order.totalDataGb)}
                </Text>
              </SurfaceCard>
            </Grid>
          </VStack>
          <Box px={5} py={4} borderTopWidth="1px" borderColor={uiColors.border} bg={uiColors.surfaceSoft}>
            <AppButton variant="dark" w="full" onClick={onClose}>
              {t.close}
            </AppButton>
          </Box>
        </SurfaceCard>
      </Box>
    </>
  );
}

function GroupOrderModal({ order, t, statusLabels, currency, onClose }) {
  if (!order) {
    return null;
  }

  const members = order.groupMembers || [];

  return (
    <>
      {modalBackdrop(onClose)}
      <Box position="fixed" inset={0} zIndex={50} display="grid" placeItems="center" p={4}>
        <SurfaceCard w="full" maxW="1040px" maxH="88vh" overflow="hidden" borderRadius="14px">
          <HStack px={6} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <Box>
              <HStack spacing={2} mb={1}>
                <Heading fontSize="xl" color={uiColors.textPrimary}>{order.groupName}</Heading>
                <StatusPill value={order.status} labels={statusLabels} />
              </HStack>
              <Text fontSize="sm" color={uiColors.textSecondary}>{t.orderId}: {order.id}</Text>
            </Box>
            <AppIconButton
              aria-label={t.close}
              icon={<XMarkIcon width={18} />}
              variant="ghost"
              onClick={onClose}
            />
          </HStack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="1px" bg={uiColors.border}>
            <SurfaceCard borderRadius="none" boxShadow="none" borderWidth="0" p={4}>
              <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                {t.stats.totalCustomers}
              </Text>
              <Text mt={1} fontWeight="800" fontSize="2xl" color={uiColors.textPrimary}>
                {members.length}
              </Text>
            </SurfaceCard>
            <SurfaceCard borderRadius="none" boxShadow="none" borderWidth="0" p={4}>
              <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                {t.stats.packagePrice}
              </Text>
              <Text mt={1} fontWeight="800" fontSize="2xl" color={uiColors.textPrimary}>
                {formatMoneyFromUzs(order.package?.priceUzs || 0, currency)}
              </Text>
            </SurfaceCard>
            <SurfaceCard borderRadius="none" boxShadow="none" borderWidth="0" p={4}>
              <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                {t.stats.totalPaid}
              </Text>
              <Text mt={1} fontWeight="800" fontSize="2xl" color="#b91c1c">
                {formatMoneyFromUzs(order.paymentTotalUzs || 0, currency)}
              </Text>
            </SurfaceCard>
          </Grid>

          <Box p={5} bg={uiColors.surfaceSoft} maxH="52vh" overflowY="auto">
            <SurfaceCard overflow="hidden" borderRadius="14px">
              <Table.Root size="sm">
                <Table.Header bg={uiColors.surfaceSoft}>
                  <Table.Row>
                    <Table.ColumnHeader>{t.table.memberName}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.table.contact}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.table.delivery}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.table.deliveryStatus}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.table.esimStatus}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">{t.table.traffic}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {members.map((member) => (
                    <Table.Row key={member.id}>
                      <Table.Cell fontWeight="600">{member.name}</Table.Cell>
                      <Table.Cell color={uiColors.textSecondary}>{member.phone || member.email || "-"}</Table.Cell>
                      <Table.Cell>
                        <HStack spacing={1.5} color={uiColors.textSecondary}>
                          {member.deliveryMethod === "sms" ? <DevicePhoneMobileIcon width={15} /> : null}
                          {member.deliveryMethod === "email" ? <EnvelopeIcon width={15} /> : null}
                          {member.deliveryMethod === "manual" ? <PrinterIcon width={15} /> : null}
                          <Text fontSize="sm">{t.deliveryMethods[member.deliveryMethod] || member.deliveryMethod}</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          bg={member.deliveryStatus === "sent" ? "#dcfce7" : "#fff0e8"}
                          color={member.deliveryStatus === "sent" ? "#166534" : "#a65f00"}
                          borderWidth="1px"
                          borderColor={member.deliveryStatus === "sent" ? "#bbf7d0" : "#ffb085"}
                          textTransform="none"
                        >
                          {t.deliveryStatus[member.deliveryStatus] || member.deliveryStatus}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell><StatusPill value={member.status} labels={statusLabels} /></Table.Cell>
                      <Table.Cell textAlign="right" fontFamily="mono" color={uiColors.textSecondary}>
                        {formatUsage(member.dataUsageGb, member.totalDataGb)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </SurfaceCard>
          </Box>

          <HStack px={5} py={4} borderTopWidth="1px" borderColor={uiColors.border} justify="end">
            <AppButton variant="dark" onClick={onClose}>
              {t.close}
            </AppButton>
          </HStack>
        </SurfaceCard>
      </Box>
    </>
  );
}

function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency } = useCurrency();
  const { dict } = useLocale();
  const t = dict.orders || uz.orders;
  const statusLabels = t.statusLabels || uz.orders.statusLabels;
  const { toasts, pushToast } = useAppToasts();

  const [activeTab, setActiveTab] = useState("client");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);
  const [selfModalOrder, setSelfModalOrder] = useState(null);
  const [groupModalOrder, setGroupModalOrder] = useState(null);

  useEffect(() => {
    const createdOrderId = location.state?.createdOrderId;
    if (!createdOrderId) {
      return;
    }

    pushToast({
      type: "success",
      title: t.toast.orderCreatedTitle,
      description: `${t.toast.orderCreatedPrefix}: ${createdOrderId}`
    });

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, pushToast, t.toast.orderCreatedPrefix, t.toast.orderCreatedTitle]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await ordersService.listPortalOrders({ tab: activeTab, query });
        if (mounted) {
          setRows(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || t.loadError);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [activeTab, query, reloadTick, t.loadError]);

  const searchPlaceholder = t.searchPlaceholder?.[activeTab] || t.searchPlaceholder.client;

  const onCopy = async (value, label) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      pushToast({
        type: "success",
        title: t.toast.copySuccessTitle,
        description: `${label} ${t.toast.copySuccessDescription}`
      });
    } catch (err) {
      pushToast({
        type: "error",
        title: t.toast.copyErrorTitle,
        description: t.toast.copyErrorDescription
      });
    }
  };

  const handleRowClick = (row) => {
    if (activeTab === "client") {
      navigate(`/orders/${row.id}`);
      return;
    }

    if (activeTab === "group") {
      setGroupModalOrder(row);
      return;
    }

    setSelfModalOrder(row);
  };

  const isClientTab = activeTab === "client";

  return (
    <Box position="relative">
      <AppToastStack items={toasts} />
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
          <Heading color={uiColors.textPrimary} fontSize={{ base: "30px", md: "32px" }} fontWeight="800" lineHeight="1.2">
            {t.title}
          </Heading>
          <AppButton
            variant="outline"
            h="40px"
            px={4}
            borderColor={uiColors.border}
            startElement={<ArrowPathIcon width={15} />}
            onClick={() => setReloadTick((v) => v + 1)}
          >
            {t.refresh}
          </AppButton>
        </HStack>

        <Box overflowX="auto">
          <SegmentedControl
            value={activeTab}
            options={[
              {
                value: "client",
                label: (
                  <HStack spacing={1.5}>
                    <UserIcon width={15} />
                    <Text>{t.tabs.client}</Text>
                  </HStack>
                )
              },
              {
                value: "group",
                label: (
                  <HStack spacing={1.5}>
                    <UsersIcon width={15} />
                    <Text>{t.tabs.group}</Text>
                  </HStack>
                )
              },
              {
                value: "self",
                label: (
                  <HStack spacing={1.5}>
                    <BuildingOfficeIcon width={15} />
                    <Text>{t.tabs.self}</Text>
                  </HStack>
                )
              }
            ]}
            onChange={setActiveTab}
          />
        </Box>

        <HStack align="stretch" gap={3} flexWrap="wrap">
          <Box position="relative" flex="1" minW={{ base: "full", md: "320px" }}>
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color={uiColors.textMuted}
              zIndex={1}
              pointerEvents="none"
              display="inline-flex"
              alignItems="center"
            >
              <MagnifyingGlassIcon width={16} />
            </Box>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              bg="white"
              pl={9}
              h="40px"
              borderColor={uiColors.border}
              borderRadius="8px"
              fontSize="sm"
            />
          </Box>
          <AppButton variant="outline" h="40px" px={4} borderColor={uiColors.border} startElement={<FunnelIcon width={14} />}>
            {t.filter}
          </AppButton>
        </HStack>

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
                  onClick={() => handleRowClick(row)}
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
                            pushToast({
                              type: "info",
                              title: t.actions.openDetails,
                              description: row.id
                            });
                          }}
                        />
                        <AppIconButton
                          aria-label={t.actions.openDetails}
                          variant="ghost"
                          size="xs"
                          icon={<ArrowRightIcon width={14} />}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRowClick(row);
                          }}
                        />
                      </HStack>
                    ) : (
                      <AppIconButton
                        aria-label={activeTab === "client" ? t.actions.openDetails : t.actions.openModal}
                        icon={<ClipboardDocumentIcon width={16} />}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRowClick(row);
                        }}
                      />
                    )}
                  </AppDataTableCell>
                </AppDataTableRow>
              ))}
            </AppDataTable>
          ) : null}
        </SurfaceCard>
      </VStack>

      <MyselfOrderModal
        order={selfModalOrder}
        t={t.modalSelf}
        statusLabels={statusLabels}
        onClose={() => setSelfModalOrder(null)}
        onCopy={onCopy}
      />

      <GroupOrderModal
        order={groupModalOrder}
        t={t.modalGroup}
        statusLabels={statusLabels}
        currency={currency}
        onClose={() => setGroupModalOrder(null)}
      />
    </Box>
  );
}

export default OrdersPage;
