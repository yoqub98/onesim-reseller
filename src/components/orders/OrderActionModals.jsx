// Renders order detail modals for self and group tabs — used in OrdersPage
import { useState } from "react";
import {
  ArrowPathIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PaperAirplaneIcon,
  PrinterIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Badge, Box, Grid, Heading, HStack, Spinner, Table, Text, VStack } from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { AppButton, AppIconButton, SurfaceCard } from "../ui";
import { DELIVERY_EMAIL, DELIVERY_MANUAL, DELIVERY_SMS } from "../../constants/delivery";
import { uiColors } from "../../design-system/tokens";
import { formatMoneyFromUsd, formatMoneyFromUzs } from "../../utils/currency";
import StatusPill from "./StatusPill";

function formatUsage(used, total) {
  if (total === 999 || total === -1) {
    return `${Number(used || 0).toFixed(1)} / ∞ GB`;
  }

  return `${Number(used || 0).toFixed(1)} / ${Number(total || 0).toFixed(1)} GB`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
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

function InfoRow({ label, value, mono = false, copyable = false, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy(value, label);
    } catch { /* ignore */ }
  };

  return (
    <HStack justify="space-between" py={2} borderBottomWidth="1px" borderColor={uiColors.border}>
      <Text fontSize="sm" color={uiColors.textMuted}>{label}</Text>
      <HStack spacing={2}>
        <Text
          fontSize="sm"
          fontWeight="600"
          color={uiColors.textPrimary}
          fontFamily={mono ? "mono" : "inherit"}
        >
          {value || "-"}
        </Text>
        {copyable && value && (
          <AppIconButton
            aria-label="Copy"
            icon={copied ? <CheckIcon width={14} color="#16a34a" /> : <ClipboardDocumentIcon width={14} />}
            size="xs"
            variant="ghost"
            onClick={handleCopy}
          />
        )}
      </HStack>
    </HStack>
  );
}

function SelfOrderModal({ order, t, statusLabels, currency, onClose, onCopy, onRefreshUsage, onResendSms }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!order) {
    return null;
  }

  const qrData = order.activationCode || order.qrCodeData || `LPA:1$esim.onesim.uz$${order.iccid}`;
  const pkg = order.package;
  const deliveryStatus = order.deliveryStatus?.status || order.deliveryStatus || "pending";

  const handleRefresh = async () => {
    if (!onRefreshUsage) return;
    setIsRefreshing(true);
    try {
      await onRefreshUsage(order.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResend = async () => {
    if (!onResendSms || !order.customerPhone) return;
    setIsResending(true);
    try {
      await onResendSms(order.id);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      {modalBackdrop(onClose)}
      <Box position="fixed" inset={0} zIndex={50} display="grid" placeItems="center" p={4} overflowY="auto">
        <SurfaceCard w="full" maxW="580px" overflow="hidden" borderRadius="14px" my={4}>
          {/* Header */}
          <HStack px={5} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <Box>
              <Heading fontSize="lg" color={uiColors.textPrimary}>{t.title}</Heading>
              {pkg && (
                <HStack spacing={2} mt={1}>
                  <GlobeAltIcon width={14} color={uiColors.textMuted} />
                  <Text fontSize="sm" color={uiColors.textSecondary}>
                    {pkg.destination || pkg.name} • {pkg.dataGb}GB • {pkg.durationDays} {t.validity?.toLowerCase() || "kun"}
                  </Text>
                </HStack>
              )}
            </Box>
            <AppIconButton
              aria-label={t.close}
              icon={<XMarkIcon width={18} />}
              variant="ghost"
              onClick={onClose}
            />
          </HStack>

          <VStack spacing={5} align="stretch" p={5}>
            {/* QR Code Section */}
            <VStack spacing={3}>
              <Box p={3} borderWidth="1px" borderColor={uiColors.border} borderRadius="14px" bg="white">
                <QRCodeSVG value={qrData} size={160} level="M" />
              </Box>
              <Text fontSize="sm" color={uiColors.textSecondary} textAlign="center">
                {t.helper}
              </Text>
            </VStack>

            {/* Status & Usage Row */}
            <Grid templateColumns="1fr 1fr" gap={3}>
              <SurfaceCard p={3} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                  {t.status}
                </Text>
                <Box mt={2}>
                  <StatusPill value={order.status} labels={statusLabels} />
                </Box>
              </SurfaceCard>
              <SurfaceCard p={3} borderRadius="10px">
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                    {t.traffic}
                  </Text>
                  {onRefreshUsage && (
                    <AppIconButton
                      aria-label={t.refreshUsage}
                      icon={isRefreshing ? <Spinner size="xs" /> : <ArrowPathIcon width={14} />}
                      size="xs"
                      variant="ghost"
                      onClick={handleRefresh}
                      isDisabled={isRefreshing}
                    />
                  )}
                </HStack>
                <Text color={uiColors.textPrimary} fontWeight="600">
                  {formatUsage(order.dataUsageGb, order.totalDataGb)}
                </Text>
              </SurfaceCard>
            </Grid>

            {/* Details Section */}
            <SurfaceCard p={4} borderRadius="10px">
              <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700" mb={2}>
                {t.iccid} & {t.shortUrl || "Link"}
              </Text>
              <InfoRow label={t.iccid} value={order.iccid} mono copyable onCopy={onCopy} />
              {order.shortUrl && (
                <InfoRow label={t.shortUrl} value={order.shortUrl} mono copyable onCopy={onCopy} />
              )}
              <InfoRow label={t.purchaseDate} value={formatDate(order.purchasedAt)} />
              {order.expiryDate && (
                <InfoRow label={t.expiryDate} value={formatDate(order.expiryDate)} />
              )}
              {order.smdpStatus && (
                <InfoRow label={t.smdpStatus} value={order.smdpStatus} />
              )}
            </SurfaceCard>

            {/* Delivery Section */}
            {order.deliveryMethod && (
              <SurfaceCard p={4} borderRadius="10px">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                    {t.deliveryStatus}
                  </Text>
                  <Badge
                    bg={deliveryStatus === "sent" || deliveryStatus === "delivered" ? "#dcfce7" : "#fff0e8"}
                    color={deliveryStatus === "sent" || deliveryStatus === "delivered" ? "#166534" : "#a65f00"}
                    borderWidth="1px"
                    borderColor={deliveryStatus === "sent" || deliveryStatus === "delivered" ? "#bbf7d0" : "#ffb085"}
                    textTransform="none"
                    fontSize="xs"
                  >
                    {t.deliveryStatuses?.[deliveryStatus] || deliveryStatus}
                  </Badge>
                </HStack>
                <InfoRow
                  label={t.deliveryMethod}
                  value={t.deliveryMethods?.[order.deliveryMethod] || order.deliveryMethod}
                />
                {order.customerPhone && (
                  <InfoRow label={t.customerPhone} value={order.customerPhone} />
                )}
                {onResendSms && order.customerPhone && (
                  <Box mt={3}>
                    <AppButton
                      variant="soft"
                      size="sm"
                      leftIcon={isResending ? <Spinner size="xs" /> : <PaperAirplaneIcon width={14} />}
                      onClick={handleResend}
                      isDisabled={isResending}
                    >
                      {isResending ? t.resending : t.resendSms}
                    </AppButton>
                  </Box>
                )}
              </SurfaceCard>
            )}

            {/* Price Section */}
            {(order.retailPriceUsd || order.partnerPaidUsd) && (
              <SurfaceCard p={4} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700" mb={2}>
                  {t.priceInfo}
                </Text>
                <InfoRow
                  label={t.retailPrice}
                  value={formatMoneyFromUsd(order.retailPriceUsd || 0, currency)}
                />
                <InfoRow
                  label={t.partnerPrice}
                  value={formatMoneyFromUsd(order.partnerPaidUsd || 0, currency)}
                />
                <InfoRow
                  label={t.discount}
                  value={`${order.discountRate || 0}% (${formatMoneyFromUsd(order.discountAmountUsd || 0, currency)})`}
                />
              </SurfaceCard>
            )}
          </VStack>

          {/* Footer */}
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
                          {member.deliveryMethod === DELIVERY_SMS ? <DevicePhoneMobileIcon width={15} /> : null}
                          {member.deliveryMethod === DELIVERY_EMAIL ? <EnvelopeIcon width={15} /> : null}
                          {member.deliveryMethod === DELIVERY_MANUAL ? <PrinterIcon width={15} /> : null}
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

function OrderActionModals({
  selfOrder,
  groupOrder,
  tSelf,
  tGroup,
  statusLabels,
  currency,
  onCloseSelf,
  onCloseGroup,
  onCopy,
  onRefreshUsage,
  onResendSms
}) {
  return (
    <>
      <SelfOrderModal
        order={selfOrder}
        t={tSelf}
        statusLabels={statusLabels}
        currency={currency}
        onClose={onCloseSelf}
        onCopy={onCopy}
        onRefreshUsage={onRefreshUsage}
        onResendSms={onResendSms}
      />
      <GroupOrderModal
        order={groupOrder}
        t={tGroup}
        statusLabels={statusLabels}
        currency={currency}
        onClose={onCloseGroup}
      />
    </>
  );
}

export default OrderActionModals;
