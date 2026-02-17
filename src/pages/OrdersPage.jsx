import { Box, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppToastStack from "../components/common/AppToastStack";
import PageHeader from "../components/layout/PageHeader";
import { OrderActionModals, OrdersFilterBar, OrdersTable } from "../components/orders";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { pageLayout } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";
import { useModal } from "../hooks/useModal";
import { useServiceData } from "../hooks/useServiceData";
import uz from "../i18n/uz";
import { ordersService } from "../services/ordersService";

// OrdersPage — orchestrates:
//   OrdersFilterBar, OrdersTable, OrderActionModals
// Data: ordersService.listPortalOrders()

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
  const selfModal = useModal();
  const groupModal = useModal();

  const queryParams = useMemo(() => ({ tab: activeTab, query }), [activeTab, query]);
  const {
    data: rowsData,
    loading: isLoading,
    error: loadError,
    refetch
  } = useServiceData(ordersService.listPortalOrders, queryParams);
  const rows = rowsData || [];
  const error = loadError ? (loadError.message || t.loadError) : "";

  useEffect(() => {
    const createdOrderId = location.state?.createdOrderId;
    if (!createdOrderId) return;

    pushToast({
      type: "success",
      title: t.toast.orderCreatedTitle,
      description: `${t.toast.orderCreatedPrefix}: ${createdOrderId}`
    });

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, pushToast, t.toast.orderCreatedPrefix, t.toast.orderCreatedTitle]);

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

  const handleRowClick = (row) => {
    if (activeTab === "client") {
      navigate(`/orders/${row.id}`);
      return;
    }

    if (activeTab === "group") {
      groupModal.open(row);
      return;
    }

    selfModal.open(row);
  };

  return (
    <Box position="relative" w="full">
      <AppToastStack items={toasts} />
      <VStack align="stretch" spacing={pageLayout.sectionGap}>
        <PageHeader title={t.title} />

        <OrdersFilterBar
          t={t}
          activeTab={activeTab}
          query={query}
          onTabChange={setActiveTab}
          onQueryChange={setQuery}
          onRefresh={refetch}
        />

        <OrdersTable
          t={t}
          activeTab={activeTab}
          rows={rows}
          isLoading={isLoading}
          error={error}
          currency={currency}
          statusLabels={statusLabels}
          onRowClick={handleRowClick}
          onQuickAction={(row) => pushToast({
            type: "info",
            title: t.actions.openDetails,
            description: row.id
          })}
        />
      </VStack>

      <OrderActionModals
        selfOrder={selfModal.data}
        groupOrder={groupModal.data}
        tSelf={t.modalSelf}
        tGroup={t.modalGroup}
        statusLabels={statusLabels}
        currency={currency}
        onCloseSelf={selfModal.close}
        onCloseGroup={groupModal.close}
        onCopy={onCopy}
      />
    </Box>
  );
}

export default OrdersPage;
