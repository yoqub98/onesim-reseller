/**
 * CustomersPage - Customer management for partners
 *
 * Features:
 * - List all customers with search and filter
 * - View customer details in modal
 * - Customer order history
 * - Customer groups membership
 *
 * TODO: Backend - Connect to real Supabase data via customersService
 */
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline";
import { Box, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import AppToastStack from "../components/common/AppToastStack";
import PageHeader from "../components/layout/PageHeader";
import {
  CustomerDetailModal,
  CustomersStatsCards,
  CustomersTable
} from "../components/customers";
import { AppButton, AppInput, AppSelect, SurfaceCard } from "../components/ui";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { pageLayout, uiColors } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";
import { useServiceData } from "../hooks/useServiceData";
import { customersService } from "../services/customersService";

// Fallback translations
const customersFallback = {
  title: "Mijozlar",
  subtitle: "Barcha mijozlarni boshqarish",
  searchPlaceholder: "Qidirish: ism, telefon, email",
  empty: "Mijozlar topilmadi",
  loadError: "Mijozlarni yuklashda xatolik",
  addCustomer: "Mijoz qo'shish",
  filters: {
    all: "Barchasi",
    active: "Faol",
    inactive: "Faol emas",
    new: "Yangi"
  },
  stats: {
    total: "Jami mijozlar",
    active: "Faol",
    inactive: "Faol emas",
    newCustomers: "Yangi"
  },
  table: {
    customer: "Mijoz",
    contact: "Kontakt",
    status: "Holat",
    orders: "Buyurtmalar",
    spent: "Sarflangan",
    lastOrder: "Oxirgi buyurtma",
    groups: "Guruhlar"
  },
  modal: {
    title: "Mijoz ma'lumotlari",
    orderHistory: "Buyurtmalar tarixi",
    groups: "Guruhlar",
    noOrders: "Buyurtmalar topilmadi",
    noGroups: "Guruhlarga qo'shilmagan",
    close: "Yopish",
    viewOrder: "Buyurtmani ko'rish"
  },
  statusLabels: {
    active: "Faol",
    inactive: "Faol emas",
    new: "Yangi"
  },
  toast: {
    copySuccess: "Nusxalandi",
    copyError: "Nusxalashda xatolik"
  }
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Barchasi" },
  { value: "active", label: "Faol" },
  { value: "inactive", label: "Faol emas" },
  { value: "new", label: "Yangi" }
];

function CustomersPage() {
  const { formatPrice } = useCurrency();
  const { dict } = useLocale();
  const t = dict.customers || customersFallback;
  const { toasts, pushToast } = useAppToasts();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Build query params for service
  const queryParams = useMemo(
    () => ({ query, status: statusFilter }),
    [query, statusFilter]
  );

  // Load customers
  const fetchCustomers = useCallback(
    () => customersService.listCustomers(queryParams),
    [queryParams]
  );
  const {
    data: customers,
    loading: isLoading,
    error: loadError
  } = useServiceData(fetchCustomers);

  const customersList = customers || [];

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

  // View customer details
  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <Box position="relative" w="full">
      <AppToastStack items={toasts} />

      <VStack align="stretch" spacing={pageLayout.sectionGap}>
        {/* Header */}
        <PageHeader
          title={t.title || customersFallback.title}
          subtitle={t.subtitle || customersFallback.subtitle}
        >
          <AppButton
            variant="primary"
            h="40px"
            leftIcon={<UserPlusIcon width={14} />}
            isDisabled
          >
            {t.addCustomer || customersFallback.addCustomer}
          </AppButton>
        </PageHeader>

        {/* Stats Cards */}
        {!isLoading && !loadError && (
          <CustomersStatsCards customers={customersList} t={t} formatPrice={formatPrice} />
        )}

        {/* Filters */}
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box flex={1} minW="240px" maxW="400px">
            <AppInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder || customersFallback.searchPlaceholder}
              leftElement={<MagnifyingGlassIcon width={16} />}
            />
          </Box>
          <Box w="160px">
            <AppSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_FILTER_OPTIONS.map((opt) => ({
                ...opt,
                label: t.filters?.[opt.value] || opt.label
              }))}
            />
          </Box>
          <Text fontSize="sm" color={uiColors.textSecondary} alignSelf="center">
            {customersList.length} {t.stats?.total ? "" : "mijoz"}
          </Text>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <VStack spacing={4}>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} h="80px" borderRadius="md" />
              ))}
            </SimpleGrid>
            <Skeleton h="400px" borderRadius="md" w="full" />
          </VStack>
        )}

        {/* Error State */}
        {loadError && (
          <SurfaceCard p={6} borderColor={uiColors.error} borderWidth="1px">
            <Text color={uiColors.error} fontWeight="600">
              {t.loadError || customersFallback.loadError}
            </Text>
            <Text mt={2} color={uiColors.textSecondary}>
              {loadError.message || "Unknown error"}
            </Text>
          </SurfaceCard>
        )}

        {/* Empty State */}
        {!isLoading && !loadError && customersList.length === 0 && (
          <SurfaceCard p={8} textAlign="center">
            <Box color={uiColors.textMuted} mb={3}>
              <UserGroupIcon width={48} style={{ margin: "0 auto" }} />
            </Box>
            <Text color={uiColors.textSecondary} fontWeight="500">
              {t.empty || customersFallback.empty}
            </Text>
          </SurfaceCard>
        )}

        {/* Customers Table */}
        {!isLoading && !loadError && customersList.length > 0 && (
          <CustomersTable
            customers={customersList}
            t={t}
            formatPrice={formatPrice}
            onCopy={handleCopy}
            onViewDetails={handleViewDetails}
          />
        )}
      </VStack>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        t={t}
        formatPrice={formatPrice}
        onClose={() => setSelectedCustomer(null)}
        onCopy={handleCopy}
      />
    </Box>
  );
}

export default CustomersPage;
