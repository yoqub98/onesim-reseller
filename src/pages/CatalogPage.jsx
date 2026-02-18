import { VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CatalogFilters, OrderModal, PackageDetailsModal, PlanCardGrid } from "../components/catalog";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { DELIVERY_EMAIL, DELIVERY_OPERATOR, DELIVERY_SMS } from "../constants/delivery";
import { pageLayout } from "../design-system/tokens";
import { useFormFields } from "../hooks/useFormFields";
import { useModal } from "../hooks/useModal";
import { catalogService } from "../services/catalogService";
import { groupsService } from "../services/groupsService";
import { formatMoneyFromUsd } from "../utils/currency";

const EMPTY_LIST = [];
const PAGE_SIZE = 15;

const DATA_OPTIONS = [
  { value: "0.5", label: "500MB" },
  { value: "1", label: "1GB" },
  { value: "2", label: "2GB" },
  { value: "3", label: "3GB" },
  { value: "5", label: "5GB" },
  { value: "10", label: "10GB" },
  { value: "15", label: "15GB" },
  { value: "20", label: "20GB" },
  { value: "30", label: "30GB" }
];

const DAY_OPTIONS = [
  { value: "1", label: "1" },
  { value: "3", label: "3" },
  { value: "5", label: "5" },
  { value: "7", label: "7" },
  { value: "10", label: "10" },
  { value: "15", label: "15" },
  { value: "20", label: "20" },
  { value: "30", label: "30" }
];

let customerCounter = 0;

function createCustomer() {
  customerCounter += 1;
  return {
    id: `customer-${customerCounter}`,
    fullName: "",
    deliveryMethod: DELIVERY_SMS,
    deliveryTime: "now",
    phone: "+998",
    email: "",
    scheduleDate: "",
    scheduleTime: "",
    errors: {}
  };
}

function CatalogPage() {
  const navigate = useNavigate();
  const { partner } = useAuth();
  const { currency } = useCurrency();
  const { dict } = useLocale();
  const t = dict.catalog;

  const detailsModal = useModal();
  const buyModal = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeOrderTab, setActiveOrderTab] = useState("customer");
  const [customers, setCustomers] = useState([createCustomer()]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);
  const [groupCandidateId, setGroupCandidateId] = useState("");

  // Server-side data state
  const [plans, setPlans] = useState(EMPTY_LIST);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [groups, setGroups] = useState(EMPTY_LIST);

  // Filter options loaded once
  const [destinationOptions, setDestinationOptions] = useState([]);

  const { fields: filters, setField } = useFormFields({
    destination: "all",
    locationType: "all",
    packageType: "all",
    data: [],
    days: []
  });

  // Abort controller ref for cancelling in-flight requests
  const abortRef = useRef(0);

  const refreshGroups = useCallback(async () => {
    const groupsList = await groupsService.listGroups();
    setGroups(groupsList);
    return groupsList;
  }, []);

  // Load filter options + groups once on mount
  useEffect(() => {
    let mounted = true;
    async function loadStaticData() {
      try {
        const [destinations, groupsList] = await Promise.all([
          catalogService.getDestinations(),
          refreshGroups()
        ]);
        if (!mounted) return;
        setDestinationOptions(destinations);
        setGroups(groupsList);
      } catch {
        // static data failure is non-critical
      }
    }
    loadStaticData();
    return () => { mounted = false; };
  }, [refreshGroups]);

  // Fetch plans whenever filters, page, or partner changes
  useEffect(() => {
    const requestId = ++abortRef.current;
    let mounted = true;

    async function fetchPage() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await catalogService.getPlans({
          partner,
          filters,
          page: currentPage,
          pageSize: PAGE_SIZE
        });
        if (!mounted || requestId !== abortRef.current) return;
        setPlans(result.plans);
        setTotalCount(result.totalCount);
      } catch (err) {
        if (!mounted || requestId !== abortRef.current) return;
        setLoadError(err);
        setPlans(EMPTY_LIST);
        setTotalCount(0);
      } finally {
        if (mounted && requestId === abortRef.current) {
          setIsLoading(false);
        }
      }
    }

    fetchPage();
    return () => { mounted = false; };
  }, [partner, filters, currentPage]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const error = loadError ? (loadError.message || "Katalogni yuklashda xatolik") : "";

  // Reset to page 1 when filters change
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    if (prevFiltersRef.current !== filters) {
      prevFiltersRef.current = filters;
      setCurrentPage(1);
    }
  }, [filters]);

  const locationTypeOptions = useMemo(
    () => [
      { value: "all", label: t.units.all },
      { value: "country", label: t.units.country },
      { value: "regional", label: t.units.regional },
      { value: "global", label: t.units.global }
    ],
    [t.units]
  );

  const packageTypeOptions = useMemo(
    () => [
      { value: "all", label: t.units.all },
      { value: "standard", label: t.units.standard },
      { value: "daily", label: t.units.daily }
    ],
    [t.units]
  );

  const dayFilterOptionsMemo = useMemo(
    () => DAY_OPTIONS.map((opt) => ({ ...opt, label: `${opt.label} ${t.units.day}` })),
    [t.units.day]
  );

  const renderOriginalPrice = useCallback(
    (plan) => formatMoneyFromUsd(plan.originalPriceUsd || 0, currency),
    [currency]
  );

  const renderResellerPrice = useCallback(
    (plan) => formatMoneyFromUsd(plan.resellerPriceUsd || 0, currency),
    [currency]
  );

  const resetOrderFlow = useCallback(() => {
    setActiveOrderTab("customer");
    setCustomers([createCustomer()]);
    setSelectedGroups([]);
    setIsGroupPickerOpen(false);
    setGroupCandidateId("");
  }, []);

  const openBuyModal = useCallback((plan) => {
    void refreshGroups().catch(() => {});
    buyModal.open(plan);
    resetOrderFlow();
  }, [buyModal, resetOrderFlow, refreshGroups]);

  const closeBuyModal = useCallback(() => {
    buyModal.close();
    resetOrderFlow();
  }, [buyModal, resetOrderFlow]);

  const updateCustomer = useCallback((id, patch) => {
    setCustomers((prev) => prev.map((customer) => {
      if (customer.id !== id) {
        return customer;
      }
      const clearedErrors = { ...customer.errors };
      Object.keys(patch).forEach((key) => delete clearedErrors[key]);
      return { ...customer, ...patch, errors: clearedErrors };
    }));
  }, []);

  const validateCustomers = useCallback(() => {
    let isValid = true;
    const nextCustomers = customers.map((customer) => {
      const errors = {};
      if (!customer.fullName.trim()) errors.fullName = "Ism Familiya majburiy";
      if (customer.deliveryMethod === DELIVERY_SMS) {
        const phone = customer.phone.replace(/\s+/g, "");
        if (!phone || phone === "+998" || phone.length < 7) errors.phone = "Telefon raqam majburiy";
      }
      if (customer.deliveryMethod === DELIVERY_EMAIL && !customer.email.trim()) errors.email = "Email manzil majburiy";
      if (customer.deliveryMethod !== DELIVERY_OPERATOR && customer.deliveryTime === "scheduled") {
        if (!customer.scheduleDate) errors.scheduleDate = "Sana majburiy";
        if (!customer.scheduleTime) errors.scheduleTime = "Vaqt majburiy";
      }
      if (Object.keys(errors).length > 0) isValid = false;
      return { ...customer, errors };
    });

    setCustomers(nextCustomers);
    return isValid;
  }, [customers]);

  const onConfirmBuy = useCallback(() => {
    if (!buyModal.data) return;
    if (activeOrderTab === "customer" && !validateCustomers()) return;
    if (activeOrderTab === "group" && selectedGroups.length === 0) {
      setIsGroupPickerOpen(true);
      return;
    }

    navigate("/new-order", {
      state: {
        preselectedPlanId: buyModal.data.id,
        orderMode: activeOrderTab === "group" ? "group" : activeOrderTab === "self" ? "self" : "customer",
        customers,
        selectedGroups,
        deliveryMethod: activeOrderTab === "group" ? (selectedGroups[0]?.deliveryMethod || DELIVERY_SMS) : undefined,
        deliveryTime: activeOrderTab === "group" ? (selectedGroups[0]?.deliveryTime || "now") : undefined
      }
    });
  }, [
    activeOrderTab,
    buyModal.data,
    customers,
    navigate,
    selectedGroups,
    validateCustomers
  ]);

  const handleDetailsPurchase = useCallback((plan) => {
    detailsModal.close();
    openBuyModal(plan);
  }, [detailsModal, openBuyModal]);

  return (
    <VStack align="stretch" spacing={pageLayout.sectionGap} w="full">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <CatalogFilters
        t={t}
        filters={filters}
        destinationOptions={destinationOptions}
        locationTypeOptions={locationTypeOptions}
        packageTypeOptions={packageTypeOptions}
        dataFilterOptions={DATA_OPTIONS}
        dayFilterOptions={dayFilterOptionsMemo}
        onChange={(patch) => {
          const [key, value] = Object.entries(patch)[0];
          setField(key, value);
        }}
      />

      <PlanCardGrid
        t={t}
        isLoading={isLoading}
        error={error}
        plans={plans}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        onOpenDetails={detailsModal.open}
        onBuy={openBuyModal}
        renderOriginalPrice={renderOriginalPrice}
        renderResellerPrice={renderResellerPrice}
      />

      <PackageDetailsModal
        t={t}
        currency={currency}
        plan={detailsModal.data}
        onClose={detailsModal.close}
        onPurchase={handleDetailsPurchase}
        renderOriginalPrice={renderOriginalPrice}
        renderResellerPrice={renderResellerPrice}
      />

      <OrderModal
        t={t}
        currency={currency}
        buyPlan={buyModal.data}
        activeOrderTab={activeOrderTab}
        customers={customers}
        groups={groups}
        selectedGroups={selectedGroups}
        isGroupPickerOpen={isGroupPickerOpen}
        groupCandidateId={groupCandidateId}
        operatorHelperText={t.modal.helperOperator}
        selfOrderHelperText={t.modal.helperSelf}
        onClose={closeBuyModal}
        onTabChange={(tab) => {
          setActiveOrderTab(tab);
          if (tab === "group") {
            void refreshGroups().catch(() => {});
          }
        }}
        onCustomerAdd={() => setCustomers((prev) => [...prev, createCustomer()])}
        onCustomerRemove={(id) => setCustomers((prev) => (prev.length <= 1 ? prev : prev.filter((customer) => customer.id !== id)))}
        onCustomerUpdate={updateCustomer}
        onGroupPickerToggle={() => setIsGroupPickerOpen((prev) => {
          const next = !prev;
          if (next) {
            void refreshGroups().catch(() => {});
          }
          return next;
        })}
        onGroupCandidateChange={setGroupCandidateId}
        onGroupAdd={async () => {
          try {
            if (!groupCandidateId) return;
            let group = groups.find((item) => item.id === groupCandidateId);
            if (!group) {
              const latestGroups = await refreshGroups();
              group = latestGroups.find((item) => item.id === groupCandidateId);
            }
            if (!group) return;
            setSelectedGroups((prev) => [...prev, group]);
            setGroupCandidateId("");
            setIsGroupPickerOpen(false);
          } catch {
            // no-op: failing group refresh should not break modal interaction
          }
        }}
        onGroupRemove={(groupId) => setSelectedGroups((prev) => prev.filter((group) => group.id !== groupId))}
        onConfirm={onConfirmBuy}
      />
    </VStack>
  );
}

export default CatalogPage;
