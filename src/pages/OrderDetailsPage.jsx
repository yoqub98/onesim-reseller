import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  BoltIcon,
  ClipboardDocumentIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PauseCircleIcon,
  PlusCircleIcon,
  TrashIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import {
  Badge,
  Box,
  Grid,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CountryFlag from "../components/common/CountryFlag";
import AppToastStack from "../components/common/AppToastStack";
import { AppButton, AppIconButton, SurfaceCard } from "../components/ui";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { uiColors } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";
import uz from "../i18n/uz";
import { ordersService } from "../services/ordersService";
import { formatMoneyFromUzs } from "../utils/currency";

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatStepTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short"
  }).format(date);
}

function formatUsage(used, total) {
  if (total === 999) {
    return `${Number(used || 0).toFixed(1)} GB / INFINITY GB`;
  }

  return `${Number(used || 0).toFixed(1)} GB / ${Number(total || 0)} GB`;
}

function usagePercent(used, total) {
  if (!total || total <= 0 || total === 999) {
    return 5;
  }

  return Math.max(0, Math.min(100, (Number(used || 0) / total) * 100));
}

function getRemainingDays(purchasedAt, validityDays, status) {
  if (status === "expired" || !purchasedAt || !validityDays) {
    return 0;
  }

  const elapsedDays = Math.floor((Date.now() - new Date(purchasedAt).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(validityDays - elapsedDays, 0);
}

function StepStatus({ completed }) {
  return (
    <Badge
      bg="#fff7ed"
      borderWidth="1px"
      borderColor="#ffedd4"
      color="#fe4f18"
      borderRadius="full"
      px={2}
      py={0.5}
      textTransform="none"
      fontSize="10px"
      fontWeight="700"
      visibility={completed ? "visible" : "hidden"}
    >
      Yakunlangan
    </Badge>
  );
}

function OrderDetailsPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currency } = useCurrency();
  const { dict } = useLocale();
  const t = dict.orders || uz.orders;
  const detail = t.detail || uz.orders.detail;
  const statusLabels = t.statusLabels || uz.orders.statusLabels;
  const { toasts, pushToast } = useAppToasts();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [links, setLinks] = useState(null);
  const [isActionBusy, setIsActionBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [orderData, installLinks] = await Promise.all([
          ordersService.getPortalOrderDetails(orderId),
          ordersService.getPortalInstallLinks(orderId)
        ]);

        if (!mounted) {
          return;
        }

        setOrder(orderData);
        setLinks(installLinks);
      } catch (err) {
        if (mounted) {
          setError(err?.message || detail.loadError);
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
  }, [detail.loadError, orderId]);

  const timeline = useMemo(() => {
    if (!order) {
      return [];
    }

    return [
      { id: "created", step: "STEP 1", label: detail.timeline.created, date: order.timeline?.createdAt },
      { id: "paid", step: "STEP 2", label: detail.timeline.paid, date: order.timeline?.paymentClearedAt },
      { id: "sent", step: "STEP 3", label: detail.timeline.sent, date: order.timeline?.deliveredAt },
      { id: "active", step: "STEP 4", label: detail.timeline.activated, date: order.timeline?.activatedAt }
    ];
  }, [detail.timeline.activated, detail.timeline.created, detail.timeline.paid, detail.timeline.sent, order]);

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

  const runAction = async (callback, successText) => {
    if (!order) {
      return;
    }

    try {
      setIsActionBusy(true);
      await callback(order.id);
      pushToast({ type: "success", title: detail.actions.successTitle, description: successText });
    } catch (err) {
      pushToast({ type: "error", title: detail.actions.errorTitle, description: detail.actions.errorDescription });
    } finally {
      setIsActionBusy(false);
    }
  };

  if (isLoading) {
    return (
      <VStack align="stretch" spacing={4}>
        <Skeleton h="36px" borderRadius="md" />
        <Skeleton h="100px" borderRadius="md" />
        <Skeleton h="220px" borderRadius="md" />
      </VStack>
    );
  }

  if (error) {
    return (
      <SurfaceCard p={4} borderColor="#fecaca" bg="#fff1f2">
        <Text color="#991b1b">{error}</Text>
      </SurfaceCard>
    );
  }

  if (!order || !order.package) {
    return (
      <VStack align="stretch" spacing={4}>
        <SurfaceCard p={6}>
          <Heading size="md" color={uiColors.textPrimary}>{detail.notFoundTitle}</Heading>
          <Text mt={2} color={uiColors.textSecondary}>{detail.notFoundDescription}</Text>
          <AppButton mt={4} variant="dark" onClick={() => navigate("/orders")}>
            {detail.back}
          </AppButton>
        </SurfaceCard>
      </VStack>
    );
  }

  const statusText = statusLabels[order.status] || order.status;
  const remainingDays = getRemainingDays(order.purchasedAt, order.package.validityDays, order.status);
  const qrData = `LPA:1$esim.onesim.uz$${order.iccid}`;
  const activatedAtText = order.timeline?.activatedAt ? `${formatDateTime(order.timeline.activatedAt)} activated` : "";

  return (
    <Box position="relative" pb={28}>
      <AppToastStack items={toasts} />
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align={{ base: "start", md: "center" }} flexWrap="wrap" gap={3}>
          <AppButton
            variant="ghost"
            h="40px"
            px={0}
            startElement={<ArrowLeftIcon width={16} />}
            onClick={() => navigate("/orders")}
          >
            {detail.back}
          </AppButton>
          <AppButton
            variant="outline"
            h="36px"
            px={3}
            borderColor={uiColors.border}
            startElement={<ArrowDownTrayIcon width={14} />}
            onClick={() => pushToast({ type: "info", title: "Invoice", description: order.id })}
          >
            Invoice yuklab olish
          </AppButton>
        </HStack>

        <HStack justify="space-between" align={{ base: "start", md: "center" }} flexWrap="wrap" gap={2}>
          <Box>
            <Heading color={uiColors.textPrimary} fontSize={{ base: "32px", md: "40px" }} fontWeight="800" lineHeight="1.1">
              {detail.orderTitle} #{order.id}
            </Heading>
            {order.customerName ? (
              <Text mt={1} color={uiColors.textSecondary}>
                {detail.customer}: <Text as="span" color={uiColors.textPrimary} fontWeight="500">{order.customerName}</Text>
              </Text>
            ) : null}
          </Box>
          <HStack spacing={2}>
            <Box
              as="span"
              px={3}
              py={1}
              borderRadius="full"
              bg="#00c950"
              color="white"
              fontWeight="600"
              fontSize="sm"
            >
              {statusText}
            </Box>
            <Text color={uiColors.textSecondary} fontSize="xs">{activatedAtText}</Text>
          </HStack>
        </HStack>

        <SurfaceCard p={6} borderRadius="14px">
          <HStack minW="720px" align="start" justify="space-between" spacing={0}>
            {timeline.map((step, index) => {
              const completed = Boolean(step.date);
              return (
                <Box key={step.id} flex="1" position="relative" pr={index === timeline.length - 1 ? 0 : 3}>
                  {index < timeline.length - 1 ? (
                    <Box
                      position="absolute"
                      top="12px"
                      left="24px"
                      right="-6px"
                      h="2px"
                      bg={completed ? uiColors.accent : uiColors.border}
                      zIndex={0}
                    />
                  ) : null}
                  <VStack align="start" position="relative" zIndex={1} spacing={1}>
                    <Box
                      w="24px"
                      h="24px"
                      borderRadius="full"
                      bg={completed ? uiColors.accent : "white"}
                      borderWidth="1px"
                      borderColor={completed ? uiColors.accent : uiColors.border}
                      display="grid"
                      placeItems="center"
                      color={completed ? "white" : uiColors.textMuted}
                    >
                      {completed ? <CheckIcon width={12} /> : <Text fontSize="10px">{index + 1}</Text>}
                    </Box>
                    <Text fontSize="10px" color={uiColors.textMuted} fontWeight="700" letterSpacing="0.5px">
                      {step.step}
                    </Text>
                    <Text fontSize="sm" color={uiColors.textPrimary} fontWeight="700">
                      {step.label}
                    </Text>
                    <StepStatus completed={completed} />
                    <Text fontSize="10px" color={uiColors.textMuted} fontFamily="mono">
                      {formatStepTime(step.date)}
                    </Text>
                  </VStack>
                </Box>
              );
            })}
          </HStack>
        </SurfaceCard>

        <Grid templateColumns={{ base: "1fr", xl: "1fr 410px" }} gap={5} alignItems="start">
          <VStack align="stretch" spacing={4}>
            <SurfaceCard p={4} borderRadius="10px">
              <HStack justify="space-between" align="center" mb={3}>
                <Heading fontSize="24px" color={uiColors.textPrimary}>{detail.usageTitle}</Heading>
                <AppButton
                  variant="soft"
                  h="30px"
                  px={3}
                  borderWidth="1px"
                  borderColor="#ffd6a8"
                  color="#f54900"
                  startElement={<BoltIcon width={14} />}
                  onClick={() => pushToast({ type: "info", title: detail.actions.topupTitle, description: detail.actions.topupNavigate })}
                >
                  {detail.actions.addPackage}
                </AppButton>
              </HStack>

              <HStack justify="space-between" mb={1}>
                <Text color={uiColors.textSecondary} fontSize="sm">{detail.used}</Text>
                <Text color={uiColors.textPrimary} fontSize="sm">{formatUsage(order.dataUsageGb, order.totalDataGb)}</Text>
              </HStack>
              <Box h="8px" borderRadius="full" bg={uiColors.surfaceSoft} overflow="hidden">
                <Box h="full" w={`${usagePercent(order.dataUsageGb, order.totalDataGb)}%`} bg={uiColors.accent} />
              </Box>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3} mt={4}>
                <Box bg={uiColors.pageBg} borderWidth="1px" borderColor={uiColors.border} borderRadius="10px" p={3}>
                  <Text fontSize="10px" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                    {detail.remainingDays}
                  </Text>
                  <Text mt={1} fontSize="31px" lineHeight="1.1" fontWeight="800" color={uiColors.textPrimary}>{remainingDays}</Text>
                </Box>
                <Box bg={uiColors.pageBg} borderWidth="1px" borderColor={uiColors.border} borderRadius="10px" p={3}>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Text fontSize="10px" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                        {detail.iccid}
                      </Text>
                      <Text mt={1} fontSize="13px" fontFamily="mono" color={uiColors.textPrimary}>{order.iccid}</Text>
                    </Box>
                    <AppIconButton
                      aria-label={detail.iccid}
                      variant="ghost"
                      size="xs"
                      icon={<ClipboardDocumentIcon width={12} />}
                      onClick={() => onCopy(order.iccid, detail.iccid)}
                    />
                  </HStack>
                </Box>
              </Grid>
            </SurfaceCard>

            <SurfaceCard p={4} borderRadius="10px">
              <Heading fontSize="24px" color={uiColors.textPrimary} mb={4}>{detail.packageTitle}</Heading>
              <Box p={3} borderRadius="10px" borderWidth="1px" borderColor={uiColors.border} bg={uiColors.pageBg}>
                <HStack spacing={3}>
                  <CountryFlag code={order.package.countryCode} size={24} />
                  <Box>
                    <Text fontWeight="700" color={uiColors.textPrimary}>
                      {order.package.destination} {order.package.dataGb === -1 ? "INFINITY" : `${order.package.dataGb}GB`}
                    </Text>
                    <Text fontSize="sm" color={uiColors.textSecondary}>
                      {detail.packageCode}: <Text as="span" fontFamily="mono" color={uiColors.textPrimary}>{order.package.code}</Text>
                    </Text>
                  </Box>
                </HStack>
              </Box>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
                <Box>
                  <Text fontSize="sm" color={uiColors.textSecondary}>{detail.operators}</Text>
                  <HStack mt={1} spacing={1.5} flexWrap="wrap">
                    {(order.package.operators || []).map((operator) => (
                      <Badge key={operator} bg={uiColors.pageBg} color="#314158" borderWidth="1px" borderColor={uiColors.border} textTransform="none">
                        {operator}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
                <Box>
                  <Text fontSize="sm" color={uiColors.textSecondary}>{detail.network}</Text>
                  <Text mt={1} fontWeight="500" fontSize="lg" color={uiColors.textPrimary}>{order.package.speed}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={uiColors.textSecondary}>{detail.hotspot}</Text>
                  <Text mt={1} fontWeight="500" fontSize="lg" color={uiColors.textPrimary}>
                    {order.package.hotspotSupported ? detail.available : detail.unavailable}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={uiColors.textSecondary}>{detail.validity}</Text>
                  <Text mt={1} fontWeight="500" fontSize="lg" color={uiColors.textPrimary}>{order.package.validityDays} {detail.days}</Text>
                </Box>
              </Grid>
            </SurfaceCard>
          </VStack>

          <SurfaceCard overflow="hidden" borderRadius="10px">
            <Box bg={uiColors.textPrimary} color="white" px={6} py={6}>
              <HStack spacing={2}>
                <DevicePhoneMobileIcon width={18} />
                <Heading fontSize="28px" fontWeight="500">{detail.installation}</Heading>
              </HStack>
            </Box>
            <VStack align="stretch" spacing={4} p={4}>
              <VStack spacing={3}>
                <Box p={4} borderWidth="1px" borderColor={uiColors.border} borderRadius="14px" bg="white" boxShadow="0px 1px 3px rgba(0,0,0,0.1)">
                  <Box
                    as="img"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`}
                    alt={detail.qrAlt}
                    w="160px"
                    h="160px"
                  />
                </Box>
                <Text fontSize="sm" color={uiColors.textSecondary} textAlign="center" maxW="318px">
                  {detail.installationHint}
                </Text>
              </VStack>
              <Box bg={uiColors.pageBg} borderWidth="1px" borderColor="#f1f5f9" borderRadius="10px" px={3} py={3}>
                <HStack justify="space-between">
                  <Text fontSize="xs" fontWeight="700" color="#314158">iOS (iPhone)</Text>
                  <AppIconButton
                    aria-label="Copy iOS link"
                    variant="ghost"
                    size="xs"
                    icon={<ClipboardDocumentIcon width={12} />}
                    onClick={() => onCopy(links?.ios, "iOS")}
                  />
                </HStack>
                <Text mt={1} fontSize="xs" color={uiColors.textSecondary} noOfLines={1}>{links?.ios || "-"}</Text>
              </Box>
              <Box bg={uiColors.pageBg} borderWidth="1px" borderColor="#f1f5f9" borderRadius="10px" px={3} py={3}>
                <HStack justify="space-between">
                  <Text fontSize="xs" fontWeight="700" color="#314158">Android</Text>
                  <AppIconButton
                    aria-label="Copy Android link"
                    variant="ghost"
                    size="xs"
                    icon={<ClipboardDocumentIcon width={12} />}
                    onClick={() => onCopy(links?.android, "Android")}
                  />
                </HStack>
                <Text mt={1} fontSize="xs" color={uiColors.textSecondary} noOfLines={1}>{links?.android || "-"}</Text>
              </Box>
              <HStack justify="space-between" pt={1}>
                <Text fontSize="sm" color={uiColors.textSecondary}>{detail.totalPaid}</Text>
                <Text fontWeight="700" color={uiColors.textPrimary}>
                  {formatMoneyFromUzs(order.paymentTotalUzs || 0, currency)}
                </Text>
              </HStack>
            </VStack>
          </SurfaceCard>
        </Grid>
      </VStack>

      <Box
        position="fixed"
        bottom={0}
        left={{ base: 0, lg: "256px" }}
        right={0}
        bg="white"
        borderTopWidth="1px"
        borderColor={uiColors.border}
        px={{ base: 4, lg: 8 }}
        py={4}
        zIndex={30}
        boxShadow="0px -4px 6px rgba(0,0,0,0.05)"
      >
        <HStack justify="flex-end" flexWrap="wrap" gap={2}>
          <AppButton
            variant="outline"
            h="40px"
            px={4}
            borderColor={uiColors.border}
            startElement={<EnvelopeIcon width={16} />}
            onClick={() => runAction(ordersService.resendPortalOrder, detail.actions.resendDone)}
            isDisabled={isActionBusy}
          >
            {detail.actions.resend}
          </AppButton>
          <AppButton
            variant="outline"
            h="40px"
            px={4}
            borderColor="#ffd6a8"
            color="#f54900"
            startElement={<PauseCircleIcon width={16} />}
            onClick={() => runAction(ordersService.suspendPortalOrder, detail.actions.pauseDone)}
            isDisabled={isActionBusy}
          >
            {detail.actions.pause}
          </AppButton>
          <AppButton
            variant="outline"
            h="40px"
            px={4}
            borderColor="#ffc9c9"
            color="#e7000b"
            startElement={<TrashIcon width={16} />}
            onClick={() => runAction(ordersService.cancelPortalOrder, detail.actions.cancelDone)}
            isDisabled={isActionBusy}
          >
            {detail.actions.cancel}
          </AppButton>
          <AppButton
            variant="dark"
            h="40px"
            px={4}
            startElement={<PlusCircleIcon width={16} />}
            onClick={() => runAction(ordersService.topupPortalOrder, detail.actions.topupDone)}
            isDisabled={isActionBusy}
          >
            {detail.actions.topup} ({detail.actions.addPackage})
          </AppButton>
        </HStack>
      </Box>
    </Box>
  );
}

export default OrderDetailsPage;
