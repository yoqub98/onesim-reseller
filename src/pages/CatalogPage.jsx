import { VStack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
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
import { useServiceData } from "../hooks/useServiceData";
import { catalogService } from "../services/catalogService";
import { groupsService } from "../services/groupsService";
import { formatMoneyFromUsd } from "../utils/currency";

const EMPTY_LIST = [];

const dataFilterOptionsBase = [
  { value: "all", label: "all" },
  { value: "upTo1", label: "<=1GB" },
  { value: "1to5", label: "1-5GB" },
  { value: "5to10", label: "5-10GB" },
  { value: "10to20", label: "10-20GB" },
  { value: "20plus", label: "20GB+" }
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

function matchesDataBucket(plan, bucket) {
  if (bucket === "all") return true;
  const dataGb = Number(plan?.dataGb || 0);

  if (bucket === "upTo1") return dataGb <= 1;
  if (bucket === "1to5") return dataGb > 1 && dataGb <= 5;
  if (bucket === "5to10") return dataGb > 5 && dataGb <= 10;
  if (bucket === "10to20") return dataGb > 10 && dataGb <= 20;
  if (bucket === "20plus") return dataGb >= 20;

  return true;
}

function CatalogPage() {
  const navigate = useNavigate();
  const { partner } = useAuth();
  const { currency } = useCurrency();
  const { dict } = useLocale();
  const t = dict.catalog;

  const detailsModal = useModal();
  const buyModal = useModal();
  const [activeOrderTab, setActiveOrderTab] = useState("customer");
  const [customers, setCustomers] = useState([createCustomer()]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);
  const [groupCandidateId, setGroupCandidateId] = useState("");

  const requestParams = useMemo(() => ({ partner }), [partner]);

  const loadCatalogPageData = useCallback(async ({ partner: partnerProfile } = {}) => {
    const [plans, groups] = await Promise.all([
      catalogService.getPlans({ partner: partnerProfile }),
      groupsService.listGroups()
    ]);
    return { plans, groups };
  }, []);

  const { data: catalogData, loading: isLoading, error: loadError } = useServiceData(loadCatalogPageData, requestParams);

  const plans = catalogData?.plans || EMPTY_LIST;
  const groups = catalogData?.groups || EMPTY_LIST;
  const error = loadError ? (loadError.message || "Katalogni yuklashda xatolik") : "";

  const { fields: filters, setField } = useFormFields({
    search: "",
    destination: "all",
    locationType: "all",
    packageType: "all",
    data: "all",
    days: "all"
  });

  const destinationOptions = useMemo(
    () => ["all", ...new Set(plans.map((plan) => plan.destination).filter(Boolean))],
    [plans]
  );

  const locationTypeOptions = useMemo(
    () => [
      { value: "all", label: t.units.all },
      { value: "country", label: "Country" },
      { value: "regional", label: "Regional" },
      { value: "global", label: "Global" }
    ],
    [t.units.all]
  );

  const packageTypeOptions = useMemo(
    () => [
      { value: "all", label: t.units.all },
      { value: "standard", label: "Standard" },
      { value: "daily", label: "Daily" }
    ],
    [t.units.all]
  );

  const dayFilterOptions = useMemo(() => {
    const durations = [...new Set(plans.map((plan) => String(plan.validityDays)).filter(Boolean))]
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value >= 0)
      .sort((a, b) => a - b);

    return [
      { value: "all", label: t.units.all },
      ...durations.map((value) => ({ value: String(value), label: `${value} ${t.units.day}` }))
    ];
  }, [plans, t.units.all, t.units.day]);

  const dataFilterOptions = useMemo(
    () =>
      dataFilterOptionsBase.map((option) => ({
        ...option,
        label: option.value === "all" ? t.units.all : option.label
      })),
    [t.units.all]
  );

  const filteredPlans = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return plans
      .filter((plan) => {
        const destinationMatch = filters.destination === "all" || plan.destination === filters.destination;
        const locationTypeMatch = filters.locationType === "all" || plan.locationType === filters.locationType;
        const packageTypeMatch =
          filters.packageType === "all" ||
          (filters.packageType === "daily" ? Number(plan.dataType) === 2 : Number(plan.dataType) !== 2);
        const dataMatch = matchesDataBucket(plan, filters.data);
        const dayMatch = filters.days === "all" || String(plan.validityDays) === filters.days;
        const searchMatch =
          !search ||
          [plan.name, plan.destination, plan.countryCode, plan.packageCode, plan.slug]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));

        return destinationMatch && locationTypeMatch && packageTypeMatch && dataMatch && dayMatch && searchMatch;
      })
      .sort((a, b) => {
        if (a.destination !== b.destination) {
          return String(a.destination).localeCompare(String(b.destination));
        }
        if (a.validityDays !== b.validityDays) {
          return Number(a.validityDays) - Number(b.validityDays);
        }
        return Number(a.dataGb) - Number(b.dataGb);
      });
  }, [filters, plans]);

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
    buyModal.open(plan);
    resetOrderFlow();
  }, [buyModal, resetOrderFlow]);

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
        dataFilterOptions={dataFilterOptions}
        dayFilterOptions={dayFilterOptions}
        onChange={(patch) => {
          const [key, value] = Object.entries(patch)[0];
          setField(key, value);
        }}
      />

      <PlanCardGrid
        t={t}
        isLoading={isLoading}
        error={error}
        plans={filteredPlans}
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
        onTabChange={setActiveOrderTab}
        onCustomerAdd={() => setCustomers((prev) => [...prev, createCustomer()])}
        onCustomerRemove={(id) => setCustomers((prev) => (prev.length <= 1 ? prev : prev.filter((customer) => customer.id !== id)))}
        onCustomerUpdate={updateCustomer}
        onGroupPickerToggle={() => setIsGroupPickerOpen((prev) => !prev)}
        onGroupCandidateChange={setGroupCandidateId}
        onGroupAdd={() => {
          if (!groupCandidateId) return;
          const group = groups.find((item) => item.id === groupCandidateId);
          if (!group) return;
          setSelectedGroups((prev) => [...prev, group]);
          setGroupCandidateId("");
          setIsGroupPickerOpen(false);
        }}
        onGroupRemove={(groupId) => setSelectedGroups((prev) => prev.filter((group) => group.id !== groupId))}
        onConfirm={onConfirmBuy}
      />
    </VStack>
  );
}

export default CatalogPage;