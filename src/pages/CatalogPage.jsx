import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import AppToastStack from "../components/common/AppToastStack";
import { CatalogFilters, PackageDetailsModal, PlanCardGrid } from "../components/catalog";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { uiColors } from "../design-system/tokens";
import { useFormFields } from "../hooks/useFormFields";
import { useAppToasts } from "../hooks/useAppToasts";
import { useModal } from "../hooks/useModal";
import { useServiceData } from "../hooks/useServiceData";
import { catalogService } from "../services/catalogService";
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
  const { partner } = useAuth();
  const { currency } = useCurrency();
  const { dict } = useLocale();
  const { toasts, pushToast } = useAppToasts();
  const t = dict.catalog;

  const detailsModal = useModal();

  const requestParams = useMemo(() => ({ partner }), [partner]);

  const loadCatalogPageData = useCallback(async ({ partner: partnerProfile } = {}) => {
    const plans = await catalogService.getPlans({ partner: partnerProfile });
    return { plans };
  }, []);

  const { data: catalogData, loading: isLoading, error: loadError } = useServiceData(loadCatalogPageData, requestParams);

  const plans = catalogData?.plans || EMPTY_LIST;
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

  const handlePurchasePlaceholder = useCallback(() => {
    pushToast({
      type: "info",
      title: "Purchase flow pending",
      description: "Purchase mechanism will be implemented in the next milestone.",
      duration: 3000
    });
  }, [pushToast]);

  return (
    <VStack align="stretch" spacing={8} w="full">
      <AppToastStack items={toasts} />
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
        <Box>
          <Heading color={uiColors.textPrimary} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">{t.title}</Heading>
          <Text color={uiColors.textSecondary} mt={1}>{t.subtitle}</Text>
        </Box>
      </Flex>

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
        onBuy={handlePurchasePlaceholder}
        renderOriginalPrice={renderOriginalPrice}
        renderResellerPrice={renderResellerPrice}
      />

      <PackageDetailsModal
        t={t}
        currency={currency}
        plan={detailsModal.data}
        onClose={detailsModal.close}
        onPurchase={handlePurchasePlaceholder}
        renderOriginalPrice={renderOriginalPrice}
        renderResellerPrice={renderResellerPrice}
      />
    </VStack>
  );
}

export default CatalogPage;