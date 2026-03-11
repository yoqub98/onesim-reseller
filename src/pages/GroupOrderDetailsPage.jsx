/**
 * GroupOrderDetailsPage - Full page view for a group/bulk eSIM order
 *
 * Features:
 * - Group order summary with stats
 * - Customer list with eSIM details
 * - Per-customer actions (resend, view details, copy)
 * - Print all QR codes
 * - Search and filter customers
 *
 * TODO: Backend - Connect to real Supabase data via ordersService
 */
import { Box, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppToastStack from "../components/common/AppToastStack";
import {
  GroupOrderHeader,
  GroupOrderStatsCards,
  GroupOrderCustomersTable,
  CustomerEsimDetailModal
} from "../components/orders";
import { SurfaceCard } from "../components/ui";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { pageLayout, uiColors } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";
import { useServiceData } from "../hooks/useServiceData";
import { ordersService } from "../services/ordersService";

// Fallback translations
const groupOrderDetailsFallback = {
  back: "Buyurtmalarga qaytish",
  printAllQr: "Barcha QR chop etish",
  orderDate: "Buyurtma sanasi",
  travelDates: "Sayohat",
  totalEsims: "Jami eSIM",
  activated: "Faollashtirilgan",
  pending: "Kutilmoqda",
  problems: "Muammo",
  searchPlaceholder: "Qidirish: ism, telefon, email, ICCID",
  customers: "mijoz",
  customer: "Mijoz",
  contact: "Kontakt",
  delivery: "Yetkazish",
  esimStatus: "eSIM holati",
  dataUsage: "Data",
  noResults: "Mijozlar topilmadi",
  resend: "Qayta yuborish",
  viewDetails: "Batafsil",
  close: "Yopish",
  pause: "To'xtatish",
  topup: "Top-up",
  installLinks: "O'rnatish linklari",
  esimDetails: "eSIM ma'lumotlari",
  package: "Paket",
  transactionNo: "Tranzaksiya",
  orderNo: "Buyurtma raqami",
  activatedAt: "Faollashtirilgan",
  installedAt: "O'rnatilgan",
  expiresAt: "Tugash sanasi",
  phone: "Telefon",
  email: "Email",
  deliveryMethod: "Yetkazish usuli",
  deliveryStatuses: {
    pending: "Kutilmoqda",
    sent: "Yuborilgan",
    delivered: "Yetkazilgan",
    failed: "Xatolik",
    bounced: "Qaytarilgan"
  },
  loadError: "Buyurtma ma'lumotlarini yuklashda xatolik",
  notFound: "Buyurtma topilmadi",
  toast: {
    copySuccess: "Nusxalandi",
    copyError: "Nusxalashda xatolik",
    resendSuccess: "Qayta yuborildi",
    resendError: "Qayta yuborishda xatolik",
    printStarted: "Chop etish oynasi ochildi"
  }
};

function GroupOrderDetailsPage() {
  const navigate = useNavigate();
  const { groupOrderId } = useParams();
  useCurrency(); // Keep context active for child components
  const { dict } = useLocale();
  const t = dict.groupOrderDetails || groupOrderDetailsFallback;
  const { toasts, pushToast } = useAppToasts();

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Load group order data - memoize service function to prevent infinite re-renders
  const fetchGroupOrder = useCallback(
    () => ordersService.getGroupOrderDetails(groupOrderId),
    [groupOrderId]
  );
  const {
    data: order,
    loading: isLoading,
    error: loadError,
    refetch
  } = useServiceData(fetchGroupOrder);

  // Copy handler
  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      pushToast({
        type: "success",
        title: t.toast?.copySuccess || "Nusxalandi",
        description: `${label} nusxalandi`
      });
    } catch (err) {
      pushToast({
        type: "error",
        title: t.toast?.copyError || "Xatolik",
        description: "Nusxalashda xatolik yuz berdi"
      });
    }
  };

  // Resend handler
  const handleResend = async (customer) => {
    try {
      await ordersService.resendGroupOrderCustomerEsim(groupOrderId, customer.id);
      pushToast({
        type: "success",
        title: t.toast?.resendSuccess || "Yuborildi",
        description: `${customer.name} ga qayta yuborildi`
      });
      refetch();
    } catch (err) {
      pushToast({
        type: "error",
        title: t.toast?.resendError || "Xatolik",
        description: "Qayta yuborishda xatolik yuz berdi"
      });
    }
  };

  // Print all QR codes
  const handlePrintAll = () => {
    if (!order?.customers?.length) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const qrCards = order.customers.map((customer) => `
      <div class="qr-card">
        <img src="${customer.qrCodeUrl}" alt="QR" />
        <div class="name">${customer.name}</div>
        <div class="iccid">${customer.iccid}</div>
      </div>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${order.groupName} - QR Codes</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, sans-serif;
            padding: 20px;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
          }
          .qr-card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            page-break-inside: avoid;
          }
          .qr-card img {
            width: 150px;
            height: 150px;
            margin-bottom: 12px;
          }
          .name {
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 4px;
          }
          .iccid {
            font-family: monospace;
            font-size: 10px;
            color: #666;
          }
          @media print {
            body { padding: 0; }
            h1 { font-size: 18px; margin-bottom: 20px; }
            .qr-card { border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <h1>${order.groupName}</h1>
        <div class="grid">${qrCards}</div>
        <script>
          window.onload = () => {
            setTimeout(() => { window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();

    pushToast({
      type: "info",
      title: t.toast?.printStarted || "Chop etish",
      description: `${order.customers.length} ta QR kod`
    });
  };

  // View customer details
  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  // Pause eSIM (placeholder)
  const handlePause = async (customer) => {
    pushToast({
      type: "info",
      title: "To'xtatish",
      description: `${customer.name} eSIM to'xtatiladi (demo)`
    });
  };

  // Topup eSIM (placeholder)
  const handleTopup = async (customer) => {
    pushToast({
      type: "info",
      title: "Top-up",
      description: `${customer.name} uchun top-up (demo)`
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <VStack align="stretch" spacing={4} p={4}>
        <Skeleton h="48px" borderRadius="md" />
        <Skeleton h="120px" borderRadius="md" />
        <Skeleton h="80px" borderRadius="md" />
        <Skeleton h="400px" borderRadius="md" />
      </VStack>
    );
  }

  // Error state
  if (loadError) {
    return (
      <SurfaceCard p={6} m={4} borderColor={uiColors.error} borderWidth="1px">
        <Text color={uiColors.error} fontWeight="600">
          {t.loadError}
        </Text>
        <Text mt={2} color={uiColors.textSecondary}>
          {loadError.message || "Unknown error"}
        </Text>
      </SurfaceCard>
    );
  }

  // Not found state
  if (!order) {
    return (
      <SurfaceCard p={6} m={4}>
        <Text color={uiColors.textPrimary} fontWeight="700" fontSize="lg">
          {t.notFound}
        </Text>
        <Text mt={2} color={uiColors.textSecondary}>
          ID: {groupOrderId}
        </Text>
      </SurfaceCard>
    );
  }

  return (
    <Box position="relative" w="full">
      <AppToastStack items={toasts} />

      <VStack align="stretch" spacing={pageLayout.sectionGap}>
        {/* Header */}
        <GroupOrderHeader
          order={order}
          t={t}
          onBack={() => navigate("/orders")}
          onPrintAll={handlePrintAll}
        />

        {/* Stats Cards */}
        <GroupOrderStatsCards
          customers={order.customers || []}
          t={t}
        />

        {/* Customers Table */}
        <GroupOrderCustomersTable
          customers={order.customers || []}
          t={t}
          onCopy={handleCopy}
          onResend={handleResend}
          onViewDetails={handleViewDetails}
        />
      </VStack>

      {/* Customer Detail Modal */}
      <CustomerEsimDetailModal
        customer={selectedCustomer}
        packageInfo={order.package}
        groupName={order.groupName}
        t={t}
        onClose={() => setSelectedCustomer(null)}
        onCopy={handleCopy}
        onResend={handleResend}
        onPause={handlePause}
        onTopup={handleTopup}
      />
    </Box>
  );
}

export default GroupOrderDetailsPage;
