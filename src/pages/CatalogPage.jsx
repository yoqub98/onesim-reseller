import { Squares2X2Icon, TableCellsIcon } from "@heroicons/react/24/outline";
import { Box, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CatalogFilters, OrderModal, PlanCardGrid } from "../components/catalog";
import { SegmentedControl } from "../components/ui";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { uiColors } from "../design-system/tokens";
import { DELIVERY_EMAIL, DELIVERY_OPERATOR, DELIVERY_SMS } from "../constants/delivery";
import { useFormFields } from "../hooks/useFormFields";
import { useModal } from "../hooks/useModal";
import { useServiceData } from "../hooks/useServiceData";
import { catalogService } from "../services/catalogService";
import { groupsService } from "../services/groupsService";
import { formatMoneyFromUzs } from "../utils/currency";
import { formatPackageDataLabel } from "../utils/package";

// CatalogPage — orchestrates:
//   CatalogFilters, PlanCardGrid, OrderModal
// Data: catalogService.getPlans(), groupsService.listGroups()

const dataFilterValues = ["all", "5GB", "10GB", "20GB", "Cheksiz"];
const dayFilterValues = ["all", "7", "15", "30", "90"];
const EMPTY_LIST = [];

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

async function loadCatalogPageData() {
  const [plans, groups] = await Promise.all([catalogService.getPlans(), groupsService.listGroups()]);
  return { plans, groups };
}

function CatalogPage() {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const { dict } = useLocale();
  const t = dict.catalog;

  const { data: catalogData, loading: isLoading, error: loadError } = useServiceData(loadCatalogPageData);
  const plans = catalogData?.plans || EMPTY_LIST;
  const groups = catalogData?.groups || EMPTY_LIST;
  const error = loadError ? (loadError.message || "Katalogni yuklashda xatolik") : "";
  const [view, setView] = useState("table");
  const { fields: filters, setField } = useFormFields({ destination: "all", data: "all", days: "all" });
  const buyModal = useModal();
  const [activeOrderTab, setActiveOrderTab] = useState("customer");
  const [customers, setCustomers] = useState([createCustomer()]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);
  const [groupCandidateId, setGroupCandidateId] = useState("");

  const destinationOptions = useMemo(() => ["all", ...new Set(plans.map((plan) => plan.destination))], [plans]);
  const dataFilterOptions = useMemo(() => dataFilterValues.map((value) => ({
    value,
    label: value === "all" ? t.units.all : value === "Cheksiz" ? t.units.unlimited : value
  })), [t.units.all, t.units.unlimited]);
  const dayFilterOptions = useMemo(() => dayFilterValues.map((value) => ({
    value,
    label: value === "all" ? t.units.all : `${value} ${t.units.day}`
  })), [t.units.all, t.units.day]);
  const filteredPlans = useMemo(() => plans.filter((plan) => {
    const dataLabel = formatPackageDataLabel(plan, t.units.unlimited);
    const destinationMatch = filters.destination === "all" || plan.destination === filters.destination;
    const dataMatch = filters.data === "all" || dataLabel === filters.data;
    const dayMatch = filters.days === "all" || String(plan.validityDays) === filters.days;
    return destinationMatch && dataMatch && dayMatch;
  }), [filters, plans, t.units.unlimited]);

  const resetOrderFlow = () => {
    setActiveOrderTab("customer");
    setCustomers([createCustomer()]);
    setSelectedGroups([]);
    setIsGroupPickerOpen(false);
    setGroupCandidateId("");
  };

  const openBuyModal = (plan) => {
    buyModal.open(plan);
    resetOrderFlow();
  };

  const closeBuyModal = () => {
    buyModal.close();
    resetOrderFlow();
  };

  const updateCustomer = (id, patch) => {
    setCustomers((prev) => prev.map((customer) => {
      if (customer.id !== id) {
        return customer;
      }
      const clearedErrors = { ...customer.errors };
      Object.keys(patch).forEach((key) => delete clearedErrors[key]);
      return { ...customer, ...patch, errors: clearedErrors };
    }));
  };

  const validateCustomers = () => {
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
  };

  const onConfirmBuy = () => {
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
  };

  return (
    <VStack align="stretch" spacing={8} maxW="1320px" mx="auto">
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
        <Box>
          <Heading color={uiColors.textPrimary} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">{t.title}</Heading>
          <Text color={uiColors.textSecondary} mt={1}>{t.subtitle}</Text>
        </Box>
        <HStack spacing={3} flexWrap="wrap">
          <SegmentedControl
            value={view}
            options={[{ value: "table", label: <TableCellsIcon width={14} /> }, { value: "cards", label: <Squares2X2Icon width={14} /> }]}
            onChange={setView}
          />
        </HStack>
      </Flex>

      <CatalogFilters
        t={t}
        filters={filters}
        destinationOptions={destinationOptions}
        dataFilterOptions={dataFilterOptions}
        dayFilterOptions={dayFilterOptions}
        onChange={(patch) => {
          const [key, value] = Object.entries(patch)[0];
          setField(key, value);
        }}
      />

      <PlanCardGrid
        t={t}
        view={view}
        isLoading={isLoading}
        error={error}
        plans={filteredPlans}
        onBuy={openBuyModal}
        renderOriginalPrice={(plan) => formatMoneyFromUzs(plan.originalPriceUzs || 0, currency)}
        renderResellerPrice={(plan) => formatMoneyFromUzs(plan.resellerPriceUzs || 0, currency)}
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
