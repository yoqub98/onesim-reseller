/**
 * CustomerEsimDetailModal - Detailed eSIM view for single customer
 *
 * Features:
 * - QR code with copy/print
 * - Full eSIM details (ICCID, status, dates)
 * - Data usage visualization
 * - Install links
 * - Action buttons (resend, pause, topup)
 */
import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  PauseIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii } from "../../design-system/tokens";
import {
  AppButton,
  AppIconButton,
  SurfaceCard,
  EsimStatusBadge,
  DataUsageBar,
  QrCodeDisplay,
  InstallLinksButtons
} from "../ui";

function formatDate(dateString) {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function InfoRow({ label, value, mono = false, copyable = false, onCopy }) {
  return (
    <HStack justify="space-between" py={2} borderBottomWidth="1px" borderColor={uiColors.border}>
      <Text fontSize="sm" color={uiColors.textSecondary}>
        {label}
      </Text>
      <HStack spacing={2}>
        <Text
          fontSize="sm"
          fontWeight="600"
          color={uiColors.textPrimary}
          fontFamily={mono ? "mono" : "inherit"}
        >
          {value || "--"}
        </Text>
        {copyable && value && (
          <AppIconButton
            aria-label={`Copy ${label}`}
            icon={<ClipboardDocumentIcon width={14} />}
            variant="ghost"
            size="xs"
            onClick={() => onCopy?.(value, label)}
          />
        )}
      </HStack>
    </HStack>
  );
}

export function CustomerEsimDetailModal({
  customer,
  packageInfo,
  groupName,
  t,
  onClose,
  onCopy,
  onResend,
  onPause,
  onTopup
}) {
  if (!customer) return null;

  const installLinks = {
    ios: `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${customer.activationCode}`,
    android: `https://esim.onesim.uz/install?iccid=${customer.iccid}`,
    manual: customer.activationCode
  };

  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      onCopy?.(value, label);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        inset={0}
        bg="rgba(15, 23, 43, 0.48)"
        backdropFilter="blur(2px)"
        zIndex={40}
        onClick={onClose}
      />

      {/* Modal */}
      <Box
        position="fixed"
        inset={0}
        zIndex={50}
        display="grid"
        placeItems="center"
        p={4}
        overflowY="auto"
      >
        <SurfaceCard
          w="full"
          maxW="600px"
          maxH="90vh"
          overflow="hidden"
          borderRadius={uiRadii.lg}
        >
          {/* Header */}
          <HStack
            px={5}
            py={4}
            justify="space-between"
            borderBottomWidth="1px"
            borderColor={uiColors.border}
          >
            <Box>
              <Text fontSize="lg" fontWeight="700" color={uiColors.textPrimary}>
                {customer.name}
              </Text>
              <Text fontSize="sm" color={uiColors.textSecondary}>
                {groupName}
              </Text>
            </Box>
            <AppIconButton
              aria-label={t?.close || "Yopish"}
              icon={<XMarkIcon width={18} />}
              variant="ghost"
              onClick={onClose}
            />
          </HStack>

          {/* Content */}
          <Box p={5} overflowY="auto" maxH="calc(90vh - 140px)">
            <VStack spacing={6} align="stretch">
              {/* QR Code Section */}
              <HStack spacing={6} align="start" flexWrap="wrap">
                <QrCodeDisplay
                  qrCodeUrl={customer.qrCodeUrl}
                  activationCode={customer.activationCode}
                  iccid={customer.iccid}
                  size="md"
                  onCopy={onCopy}
                />

                <VStack align="start" spacing={3} flex={1} minW="200px">
                  <Box>
                    <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="600" mb={1}>
                      {t?.status || "Holat"}
                    </Text>
                    <EsimStatusBadge status={customer.esimStatus} size="md" />
                  </Box>

                  <Box w="full">
                    <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="600" mb={2}>
                      {t?.dataUsage || "Data ishlatilgan"}
                    </Text>
                    <DataUsageBar
                      usedGb={customer.dataUsedGb}
                      totalGb={customer.dataTotalGb}
                      size="md"
                      labelPosition="top"
                    />
                  </Box>
                </VStack>
              </HStack>

              {/* Install Links */}
              <SurfaceCard p={4} borderRadius={uiRadii.sm} bg={uiColors.surfaceSoft}>
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="600" mb={3}>
                  {t?.installLinks || "O'rnatish linklari"}
                </Text>
                <InstallLinksButtons
                  iosLink={installLinks.ios}
                  androidLink={installLinks.android}
                  manualCode={installLinks.manual}
                  onCopy={handleCopy}
                />
              </SurfaceCard>

              {/* eSIM Details */}
              <Box>
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="600" mb={2}>
                  {t?.esimDetails || "eSIM ma'lumotlari"}
                </Text>
                <SurfaceCard p={4} borderRadius={uiRadii.sm}>
                  <VStack spacing={0} align="stretch">
                    <InfoRow
                      label="ICCID"
                      value={customer.iccid}
                      mono
                      copyable
                      onCopy={handleCopy}
                    />
                    <InfoRow
                      label={t?.transactionNo || "Tranzaksiya raqami"}
                      value={customer.esimTranNo}
                      mono
                    />
                    <InfoRow
                      label={t?.orderNo || "Buyurtma raqami"}
                      value={customer.orderNo}
                      mono
                    />
                    <InfoRow
                      label={t?.activatedAt || "Faollashtirilgan"}
                      value={formatDate(customer.activatedAt)}
                    />
                    <InfoRow
                      label={t?.installedAt || "O'rnatilgan"}
                      value={formatDate(customer.installedAt)}
                    />
                    <InfoRow
                      label={t?.expiresAt || "Amal qilish muddati"}
                      value={formatDate(customer.expiresAt)}
                    />
                  </VStack>
                </SurfaceCard>
              </Box>

              {/* Package Info */}
              {packageInfo && (
                <Box>
                  <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="600" mb={2}>
                    {t?.package || "Paket"}
                  </Text>
                  <SurfaceCard p={4} borderRadius={uiRadii.sm}>
                    <HStack justify="space-between" flexWrap="wrap" gap={2}>
                      <Text fontWeight="600" color={uiColors.textPrimary}>
                        {packageInfo.name}
                      </Text>
                      <Text color={uiColors.textSecondary}>
                        {packageInfo.dataGb} GB / {packageInfo.validityDays} kun
                      </Text>
                    </HStack>
                  </SurfaceCard>
                </Box>
              )}

              {/* Contact Info */}
              <Box>
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="600" mb={2}>
                  {t?.contact || "Kontakt"}
                </Text>
                <SurfaceCard p={4} borderRadius={uiRadii.sm}>
                  <VStack spacing={0} align="stretch">
                    <InfoRow
                      label={t?.phone || "Telefon"}
                      value={customer.phone}
                      copyable
                      onCopy={handleCopy}
                    />
                    <InfoRow
                      label={t?.email || "Email"}
                      value={customer.email}
                      copyable
                      onCopy={handleCopy}
                    />
                    <InfoRow
                      label={t?.deliveryMethod || "Yetkazish usuli"}
                      value={customer.deliveryMethod?.toUpperCase()}
                    />
                  </VStack>
                </SurfaceCard>
              </Box>
            </VStack>
          </Box>

          {/* Footer Actions */}
          <HStack
            px={5}
            py={4}
            borderTopWidth="1px"
            borderColor={uiColors.border}
            bg={uiColors.surfaceSoft}
            spacing={3}
            justify="end"
            flexWrap="wrap"
          >
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
              variant="outline"
              size="sm"
              leftIcon={<PauseIcon width={14} />}
              onClick={() => onPause?.(customer)}
              isDisabled={customer.esimStatus !== "IN_USE"}
            >
              {t?.pause || "To'xtatish"}
            </AppButton>
            <AppButton
              variant="primary"
              size="sm"
              leftIcon={<PlusIcon width={14} />}
              onClick={() => onTopup?.(customer)}
            >
              {t?.topup || "Top-up"}
            </AppButton>
          </HStack>
        </SurfaceCard>
      </Box>
    </>
  );
}

export default CustomerEsimDetailModal;
