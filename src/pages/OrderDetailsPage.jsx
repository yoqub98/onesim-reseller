import { ArrowDownTrayIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Box, Grid, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppToastStack from "../components/common/AppToastStack";
import {
  OrderActionButtonsBar,
  OrderInfoSummaryCard,
  OrderInstallationCard,
  OrderTimeline,
  PackageDetailsCard
} from "../components/orders";
import { AppButton, SurfaceCard } from "../components/ui";
import { uiColors } from "../design-system/tokens";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { useAppToasts } from "../hooks/useAppToasts";
import { useServiceData } from "../hooks/useServiceData";
import uz from "../i18n/uz";
import { ordersService } from "../services/ordersService";

// OrderDetailsPage — orchestrates:
//   OrderInfoSummaryCard, PackageDetailsCard, OrderTimeline, OrderActionButtonsBar
// Data: ordersService.getPortalOrderDetails(), ordersService.getPortalInstallLinks()

async function loadOrderDetailsData(params) {
  const [order, links] = await Promise.all([
    ordersService.getPortalOrderDetails(params.orderId),
    ordersService.getPortalInstallLinks(params.orderId)
  ]);

  return { order, links };
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
  const serviceParams = useMemo(() => ({ orderId }), [orderId]);

  const {
    data: detailData,
    loading: isLoading,
    error: loadError
  } = useServiceData(loadOrderDetailsData, serviceParams);
  const order = detailData?.order || null;
  const links = detailData?.links || null;
  const error = loadError ? (loadError.message || detail.loadError) : "";
  const [isActionBusy, setIsActionBusy] = useState(false);

  const timeline = useMemo(() => {
    if (!order) return [];

    return [
      { id: "created", step: "STEP 1", label: detail.timeline.created, date: order.timeline?.createdAt },
      { id: "paid", step: "STEP 2", label: detail.timeline.paid, date: order.timeline?.paymentClearedAt },
      { id: "sent", step: "STEP 3", label: detail.timeline.sent, date: order.timeline?.deliveredAt },
      { id: "active", step: "STEP 4", label: detail.timeline.activated, date: order.timeline?.activatedAt }
    ];
  }, [detail.timeline.activated, detail.timeline.created, detail.timeline.paid, detail.timeline.sent, order]);

  const onCopy = async (value, label) => {
    if (!value) return;

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
    if (!order) return;

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
        <Text color="#991b1b">{error || detail.loadError}</Text>
      </SurfaceCard>
    );
  }

  if (!order || !order.package) {
    return (
      <VStack align="stretch" spacing={4}>
        <SurfaceCard p={6}>
          <Text color={uiColors.textPrimary} fontSize="lg" fontWeight="700">{detail.notFoundTitle}</Text>
          <Text mt={2} color={uiColors.textSecondary}>{detail.notFoundDescription}</Text>
          <AppButton mt={4} variant="dark" onClick={() => navigate("/orders")}>{detail.back}</AppButton>
        </SurfaceCard>
      </VStack>
    );
  }

  return (
    <Box position="relative" pb={28} maxW="1320px" mx="auto">
      <AppToastStack items={toasts} />
      <VStack align="stretch" spacing={8}>
        <HStack justify="space-between" align={{ base: "start", md: "center" }} flexWrap="wrap" gap={3}>
          <AppButton variant="ghost" h="40px" px={0} startElement={<ArrowLeftIcon width={16} />} onClick={() => navigate("/orders")}>{detail.back}</AppButton>
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

        <OrderInfoSummaryCard order={order} detail={detail} statusText={statusLabels[order.status] || order.status} />
        <OrderTimeline timeline={timeline} />

        <Grid templateColumns={{ base: "1fr", xl: "1fr 410px" }} gap={5} alignItems="start">
          <PackageDetailsCard
            order={order}
            detail={detail}
            onCopy={onCopy}
            onTopupClick={() => pushToast({ type: "info", title: detail.actions.topupTitle, description: detail.actions.topupNavigate })}
          />
          <OrderInstallationCard
            order={order}
            links={links}
            detail={detail}
            currency={currency}
            onCopy={onCopy}
          />
        </Grid>
      </VStack>

      <OrderActionButtonsBar
        detail={detail}
        isActionBusy={isActionBusy}
        onResend={() => runAction(ordersService.resendPortalOrder, detail.actions.resendDone)}
        onPause={() => runAction(ordersService.suspendPortalOrder, detail.actions.pauseDone)}
        onCancel={() => runAction(ordersService.cancelPortalOrder, detail.actions.cancelDone)}
        onTopup={() => runAction(ordersService.topupPortalOrder, detail.actions.topupDone)}
      />
    </Box>
  );
}

export default OrderDetailsPage;
