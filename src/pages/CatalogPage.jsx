import {
  CalendarDaysIcon,
  ClockIcon,
  CreditCardIcon,
  EnvelopeIcon,
  FunnelIcon,
  HeartIcon,
  InformationCircleIcon,
  PlusIcon,
  PhoneIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  TableCellsIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import {
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Skeleton,
  Text,
  VStack
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { useNavigate } from "react-router-dom";
import CountryFlag from "../components/common/CountryFlag";
import {
  AppButton,
  AppIconButton,
  AppSelect,
  FilterChips,
  SegmentedControl,
  SurfaceCard
} from "../components/ui";
import { useCurrency } from "../context/CurrencyContext";
import { useLocale } from "../context/LocaleContext";
import { uiColors, uiRadii, uiShadows } from "../design-system/tokens";
import { catalogService } from "../services/catalogService";
import { groupsService } from "../services/groupsService";
import { formatMoneyFromUzs, formatMoneyPartsFromUzs } from "../utils/currency";

const dataFilterValues = ["all", "5GB", "10GB", "20GB", "Cheksiz"];
const dayFilterValues = ["all", "7", "15", "30", "90"];

let customerCounter = 0;

function createCustomer() {
  customerCounter += 1;

  return {
    id: `customer-${customerCounter}`,
    fullName: "",
    deliveryMethod: "sms",
    deliveryTime: "now",
    phone: "+998",
    email: "",
    scheduleDate: "",
    scheduleTime: "",
    errors: {}
  };
}

function formatDataLabel(plan) {
  if (plan.dataLabel) {
    return plan.dataLabel;
  }

  if (!plan.dataGb || Number(plan.dataGb) === 0) {
    return "Cheksiz";
  }

  return `${plan.dataGb}GB`;
}

function CatalogPage() {
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();
  const { locale, setLocale, dict } = useLocale();
  const t = dict.catalog;

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("table");
  const [filters, setFilters] = useState({
    destination: "all",
    data: "all",
    days: "all"
  });

  const [buyPlan, setBuyPlan] = useState(null);
  const [activeOrderTab, setActiveOrderTab] = useState("customer");
  const [customers, setCustomers] = useState([createCustomer()]);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);
  const [groupCandidateId, setGroupCandidateId] = useState("");
  const operatorHelperText = t.modal.helperOperator;

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [catalogData, groupsData] = await Promise.all([
          catalogService.getPlans(),
          groupsService.listGroups()
        ]);
        setPlans(catalogData);
        setGroups(groupsData);
      } catch (fetchError) {
        setError(fetchError?.message || "Katalogni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const destinationOptions = useMemo(
    () => ["all", ...new Set(plans.map((plan) => plan.destination))],
    [plans]
  );

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const dataLabel = formatDataLabel(plan);
      const destinationMatch =
        filters.destination === "all" || plan.destination === filters.destination;
      const dataMatch = filters.data === "all" || dataLabel === filters.data;
      const dayMatch = filters.days === "all" || String(plan.validityDays) === filters.days;

      return destinationMatch && dataMatch && dayMatch;
    });
  }, [filters, plans]);

  const dataFilterOptions = useMemo(() => {
    return dataFilterValues.map((value) => ({
      value,
      label: value === "all" ? t.units.all : value === "Cheksiz" ? t.units.unlimited : value
    }));
  }, [t.units.all, t.units.unlimited]);

  const dayFilterOptions = useMemo(() => {
    return dayFilterValues.map((value) => ({
      value,
      label: value === "all" ? t.units.all : `${value} ${t.units.day}`
    }));
  }, [t.units.all, t.units.day]);

  const openBuyModal = (plan) => {
    setBuyPlan(plan);
    setActiveOrderTab("customer");
    setCustomers([createCustomer()]);
    setSelectedGroups([]);
    setIsGroupPickerOpen(false);
    setGroupCandidateId("");
  };

  const closeBuyModal = () => {
    setBuyPlan(null);
    setActiveOrderTab("customer");
    setCustomers([createCustomer()]);
    setSelectedGroups([]);
    setIsGroupPickerOpen(false);
    setGroupCandidateId("");
  };

  const updateCustomer = (id, patch) => {
    setCustomers((prev) => prev.map((customer) => {
      if (customer.id !== id) {
        return customer;
      }

      const clearedErrors = { ...customer.errors };
      Object.keys(patch).forEach((key) => {
        delete clearedErrors[key];
      });

      return {
        ...customer,
        ...patch,
        errors: clearedErrors
      };
    }));
  };

  const addCustomer = () => {
    setCustomers((prev) => [...prev, createCustomer()]);
  };

  const availableGroups = useMemo(() => {
    const selectedIds = new Set(selectedGroups.map((group) => group.id));
    return groups.filter((group) => !selectedIds.has(group.id));
  }, [groups, selectedGroups]);

  const addGroupToOrder = () => {
    if (!groupCandidateId) {
      return;
    }

    const group = groups.find((item) => item.id === groupCandidateId);
    if (!group) {
      return;
    }

    setSelectedGroups((prev) => [...prev, group]);
    setGroupCandidateId("");
    setIsGroupPickerOpen(false);
  };

  const removeGroupFromOrder = (groupId) => {
    setSelectedGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  const removeCustomer = (id) => {
    setCustomers((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      return prev.filter((customer) => customer.id !== id);
    });
  };

  const validateCustomers = () => {
    let isValid = true;

    const nextCustomers = customers.map((customer) => {
      const errors = {};

      if (!customer.fullName.trim()) {
        errors.fullName = "Ism Familiya majburiy";
      }

      if (customer.deliveryMethod === "sms") {
        const phone = customer.phone.replace(/\s+/g, "");
        if (!phone || phone === "+998" || phone.length < 7) {
          errors.phone = "Telefon raqam majburiy";
        }
      }

      if (customer.deliveryMethod === "email" && !customer.email.trim()) {
        errors.email = "Email manzil majburiy";
      }

      if (customer.deliveryMethod !== "operator" && customer.deliveryTime === "scheduled") {
        if (!customer.scheduleDate) {
          errors.scheduleDate = "Sana majburiy";
        }
        if (!customer.scheduleTime) {
          errors.scheduleTime = "Vaqt majburiy";
        }
      }

      if (Object.keys(errors).length > 0) {
        isValid = false;
      }

      return {
        ...customer,
        errors
      };
    });

    setCustomers(nextCustomers);

    return isValid;
  };

  const validateGroupOrder = () => {
    return selectedGroups.length > 0;
  };

  const onConfirmBuy = () => {
    if (!buyPlan) {
      return;
    }

    if (activeOrderTab === "customer" && !validateCustomers()) {
      return;
    }

    if (activeOrderTab === "group" && !validateGroupOrder()) {
      setIsGroupPickerOpen(true);
      return;
    }

    navigate("/new-order", {
      state: {
        preselectedPlanId: buyPlan.id,
        orderMode: activeOrderTab === "group" ? "group" : "customer",
        customers,
        selectedGroups,
        deliveryMethod: activeOrderTab === "group" ? (selectedGroups[0]?.deliveryMethod || "sms") : undefined,
        deliveryTime: activeOrderTab === "group" ? (selectedGroups[0]?.deliveryTime || "now") : undefined
      }
    });
  };

  const renderResellerPrice = (plan) => {
    const uzsValue = plan.resellerPriceUzs || 0;
    return formatMoneyFromUzs(uzsValue, currency);
  };

  const renderOriginalPrice = (plan) => {
    const uzsValue = plan.originalPriceUzs || 0;
    return formatMoneyFromUzs(uzsValue, currency);
  };

  const groupMemberCount = selectedGroups.reduce(
    (sum, group) => sum + (Array.isArray(group.members) ? group.members.length : 0),
    0
  );
  const effectiveCustomerCount = activeOrderTab === "group" ? groupMemberCount : customers.length;
  const customerCount = Math.max(effectiveCustomerCount, 1);
  const packageUnitPrice = buyPlan?.resellerPriceUzs || 0;
  const packageTotal = packageUnitPrice * customerCount;
  const partnerDiscount = Math.round(packageTotal * 0.05);
  const partnerProfit = partnerDiscount;
  const totalPayment = packageTotal - partnerDiscount;
  const totalPaymentParts = formatMoneyPartsFromUzs(totalPayment, currency);

  return (
    <VStack align="stretch" spacing={5} maxW="1320px" mx="auto">
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
        <Box>
          <Heading color={uiColors.textPrimary} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
            {t.title}
          </Heading>
          <Text color={uiColors.textSecondary} mt={1}>
            {t.subtitle}
          </Text>
        </Box>

        <HStack spacing={3} flexWrap="wrap">
          <SegmentedControl
            value={currency}
            options={[
              { value: "UZS", label: "UZS" },
              { value: "USD", label: "USD" }
            ]}
            onChange={setCurrency}
          />

          <SegmentedControl
            value={locale}
            options={[
              {
                value: "uz",
                label: (
                  <HStack spacing={1.5}>
                    <Box w="14px" h="14px" borderRadius="full" overflow="hidden" flexShrink={0}>
                      <CircleFlag countryCode="uz" height={14} />
                    </Box>
                    <Text>UZ</Text>
                  </HStack>
                )
              },
              {
                value: "ru",
                label: (
                  <HStack spacing={1.5}>
                    <Box w="14px" h="14px" borderRadius="full" overflow="hidden" flexShrink={0}>
                      <CircleFlag countryCode="ru" height={14} />
                    </Box>
                    <Text>RU</Text>
                  </HStack>
                )
              }
            ]}
            onChange={setLocale}
          />

          <SegmentedControl
            value={view}
            options={[
              { value: "table", label: <TableCellsIcon width={14} /> },
              { value: "cards", label: <Squares2X2Icon width={14} /> }
            ]}
            onChange={setView}
          />
        </HStack>
      </Flex>

      <SurfaceCard p={{ base: 4, md: 5 }}>
        <HStack mb={3} spacing={2} color={uiColors.textPrimary}>
          <FunnelIcon width={16} />
          <Text fontWeight="600">{t.filtersTitle}</Text>
        </HStack>

        <Grid templateColumns={{ base: "1fr", lg: "240px 1fr 1fr" }} gap={4}>
          <Box>
            <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
              {t.filters.destination}
            </Text>
            <AppSelect
              value={filters.destination}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, destination: event.target.value }))
              }
            >
              {destinationOptions.map((destination) => (
                <option key={destination} value={destination}>
                  {destination === "all" ? t.units.all : destination}
                </option>
              ))}
            </AppSelect>
          </Box>

          <Box>
            <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
              {t.filters.gb}
            </Text>
            <FilterChips
              value={filters.data}
              options={dataFilterOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, data: value }))}
            />
          </Box>

          <Box>
            <Text fontSize="xs" color={uiColors.textSecondary} mb={1.5}>
              {t.filters.days}
            </Text>
            <FilterChips
              value={filters.days}
              options={dayFilterOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, days: value }))}
            />
          </Box>
        </Grid>
      </SurfaceCard>

      {error ? (
        <SurfaceCard p={4} borderColor="#fecaca">
          <Text color="#b91c1c" fontSize="sm">{error}</Text>
        </SurfaceCard>
      ) : null}

      {isLoading ? (
        <SurfaceCard p={4}>
          <VStack spacing={3} align="stretch">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} height="62px" borderRadius={uiRadii.sm} />
            ))}
          </VStack>
        </SurfaceCard>
      ) : null}

      {!isLoading && filteredPlans.length === 0 ? (
        <SurfaceCard p={8} textAlign="center">
          <Text color={uiColors.textSecondary}>{t.noPlans}</Text>
        </SurfaceCard>
      ) : null}

      {!isLoading && filteredPlans.length > 0 ? (
        <SurfaceCard overflow="hidden">
          {view === "table" ? (
            <Box overflowX="auto">
              <Box minW="920px">
                <Grid
                  templateColumns="2.2fr 1.4fr 1fr 1fr 1.6fr"
                  bg={uiColors.surfaceSoft}
                  borderBottomWidth="1px"
                  borderColor={uiColors.border}
                >
                  {[t.table.package, t.table.price, t.table.validity, t.table.speed, t.table.actions].map((header) => (
                    <Text key={header} px={6} py={4} fontSize="xs" fontWeight="700" color="#5f718b">
                      {header}
                    </Text>
                  ))}
                </Grid>

                {filteredPlans.map((plan) => (
                  <Grid
                    key={plan.id}
                    templateColumns="2.2fr 1.4fr 1fr 1fr 1.6fr"
                    alignItems="center"
                    borderBottomWidth="1px"
                    borderColor={uiColors.border}
                  >
                    <HStack px={6} py={3.5} spacing={3}>
                      <CountryFlag code={plan.countryCode} size={40} />
                      <Box>
                        <Text color={uiColors.textPrimary} fontSize="sm" fontWeight="700">
                          {plan.destination}
                        </Text>
                        <Text color={uiColors.textSecondary} fontSize="xs">
                          {formatDataLabel(plan)}
                        </Text>
                      </Box>
                    </HStack>

                    <Box px={6} py={3.5}>
                      <Text color={uiColors.textMuted} textDecor="line-through" fontSize="xs" fontWeight="500">
                        {renderOriginalPrice(plan)}
                      </Text>
                      <Text color={uiColors.textPrimary} fontSize="md" fontWeight="700">
                        {renderResellerPrice(plan)}
                      </Text>
                    </Box>

                    <Text px={6} py={3.5} color="#45556c" fontSize="sm">
                      {plan.validityDays} {t.units.day}
                    </Text>

                    <Box px={6} py={3.5}>
                      <Badge
                        bg={uiColors.accentSoft}
                        color={uiColors.accent}
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="500"
                        textTransform="none"
                      >
                        {plan.speed || plan.coverage}
                      </Badge>
                    </Box>

                    <HStack px={6} py={3.5} justify="end" spacing={2}>
                      <AppIconButton
                        aria-label="Batafsil"
                        icon={<ShoppingBagIcon width={16} />}
                        variant="ghost"
                        onClick={() => openBuyModal(plan)}
                      />
                      <AppIconButton aria-label="Sevimlilar" icon={<HeartIcon width={16} />} variant="ghost" />
                      <AppButton variant="outline" h="36px" px={5} onClick={() => openBuyModal(plan)}>
                        {t.buy}
                      </AppButton>
                    </HStack>
                  </Grid>
                ))}
              </Box>
            </Box>
          ) : (
            <Grid p={4} gap={3} templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}>
              {filteredPlans.map((plan) => (
                <SurfaceCard key={plan.id} p={4} boxShadow="none">
                  <HStack justify="space-between" align="start">
                    <HStack spacing={3}>
                      <CountryFlag code={plan.countryCode} size={32} />
                      <Box>
                        <Text fontWeight="700" color={uiColors.textPrimary}>{plan.destination}</Text>
                        <Text fontSize="xs" color={uiColors.textSecondary}>{formatDataLabel(plan)}</Text>
                      </Box>
                    </HStack>
                    <Badge bg={uiColors.accentSoft} color={uiColors.accent} textTransform="none">
                      {plan.speed || plan.coverage}
                    </Badge>
                  </HStack>

                  <Text mt={3} textDecor="line-through" color={uiColors.textMuted} fontSize="xs">{renderOriginalPrice(plan)}</Text>
                  <Text color={uiColors.textPrimary} fontWeight="700">{renderResellerPrice(plan)}</Text>
                  <Text fontSize="sm" color={uiColors.textSecondary}>{plan.validityDays} {t.units.day}</Text>

                  <HStack mt={3} spacing={2}>
                    <AppButton variant="ghost" onClick={() => openBuyModal(plan)}>
                      {t.details}
                    </AppButton>
                    <AppButton variant="outline" onClick={() => openBuyModal(plan)}>
                      {t.buy}
                    </AppButton>
                  </HStack>
                </SurfaceCard>
              ))}
            </Grid>
          )}
        </SurfaceCard>
      ) : null}

      {buyPlan ? (
        <Box position="fixed" inset={0} zIndex={45} bg="rgba(15, 23, 43, 0.45)" onClick={closeBuyModal}>
          <SurfaceCard
            position="absolute"
            top={{ base: 2, md: "50%" }}
            left="50%"
            transform={{ base: "translateX(-50%)", md: "translate(-50%, -50%)" }}
            w={{ base: "calc(100% - 8px)", md: "512px" }}
            maxH={{ base: "calc(100vh - 8px)", md: "calc(100vh - 32px)" }}
            borderRadius="14px"
            overflow="hidden"
            boxShadow="0px 25px 50px -12px rgba(0,0,0,0.25)"
            onClick={(event) => event.stopPropagation()}
          >
            <Flex px={4} h="61px" align="center" justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
              <Text fontWeight="800" fontSize={{ base: "lg", md: "20px" }} color={uiColors.textPrimary}>{t.modal.title}</Text>
              <IconButton aria-label="Yopish" icon={<XMarkIcon width={18} />} variant="ghost" onClick={closeBuyModal} />
            </Flex>

            <Grid templateColumns="repeat(3,1fr)" h="54px" borderBottomWidth="1px" borderColor={uiColors.border}>
              <Box
                borderBottomWidth="2px"
                borderColor={activeOrderTab === "self" ? uiColors.accent : "transparent"}
                bg={activeOrderTab === "self" ? "rgba(254,79,24,0.05)" : "transparent"}
                display="grid"
                placeItems="center"
                cursor="pointer"
                onClick={() => setActiveOrderTab("self")}
              >
                <HStack spacing={2} color={uiColors.textSecondary}><UserIcon width={15} /><Text fontSize="sm">{t.modal.tabSelf}</Text></HStack>
              </Box>
              <Box
                borderBottomWidth="2px"
                borderColor={activeOrderTab === "customer" ? uiColors.accent : "transparent"}
                bg={activeOrderTab === "customer" ? "rgba(254,79,24,0.05)" : "transparent"}
                display="grid"
                placeItems="center"
                cursor="pointer"
                onClick={() => setActiveOrderTab("customer")}
              >
                <HStack spacing={2} color={activeOrderTab === "customer" ? uiColors.accent : uiColors.textSecondary}><UserIcon width={15} /><Text fontSize="sm">{t.modal.tabCustomer}</Text></HStack>
              </Box>
              <Box
                borderBottomWidth="2px"
                borderColor={activeOrderTab === "group" ? uiColors.accent : "transparent"}
                bg={activeOrderTab === "group" ? "rgba(254,79,24,0.05)" : "transparent"}
                display="grid"
                placeItems="center"
                cursor="pointer"
                onClick={() => setActiveOrderTab("group")}
              >
                <HStack spacing={2} color={activeOrderTab === "group" ? uiColors.accent : uiColors.textSecondary}><UsersIcon width={15} /><Text fontSize="sm">{t.modal.tabGroup}</Text></HStack>
              </Box>
            </Grid>

            <Box bg="rgba(248,250,252,0.6)" px={4} py={6} maxH={{ base: "54vh", md: "500px" }} overflowY="auto">
              <SurfaceCard p={3} boxShadow={uiShadows.soft} mb={6}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <CountryFlag code={buyPlan.countryCode} size={32} />
                    <Box>
                      <Text fontSize="sm" fontWeight="700" color={uiColors.textPrimary}>{buyPlan.destination}</Text>
                      <Text fontSize="sm" color={uiColors.textSecondary}>{formatDataLabel(buyPlan)} • {buyPlan.validityDays} {t.units.day}</Text>
                    </Box>
                  </HStack>
                  <Text fontSize={{ base: "22px", md: "26px" }} fontWeight="700" color={uiColors.textPrimary}>
                    {formatMoneyFromUzs(packageUnitPrice, currency)}
                  </Text>
                </Flex>
              </SurfaceCard>

              {activeOrderTab === "group" ? (
                <>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontWeight="700" fontSize={{ base: "16px", md: "18px" }} color="#0a0a0a">
                      {t.modal.groups} ({selectedGroups.length})
                    </Text>
                    <AppButton
                      variant="ghost"
                      h="32px"
                      borderRadius="26px"
                      borderColor="#8294ac"
                      borderWidth="1px"
                      leftIcon={<PlusIcon width={14} />}
                      onClick={() => setIsGroupPickerOpen((prev) => !prev)}
                    >
                      {t.modal.addGroup}
                    </AppButton>
                  </Flex>

                  {isGroupPickerOpen ? (
                    <SurfaceCard p={3} mb={5} boxShadow={uiShadows.soft}>
                      <Text fontSize="sm" color={uiColors.textPrimary} mb={2} fontWeight="600">
                        {t.modal.selectGroup}
                      </Text>
                      <HStack>
                        <AppSelect
                          flex="1"
                          value={groupCandidateId}
                          onChange={(event) => setGroupCandidateId(event.target.value)}
                        >
                          <option value="">{t.modal.select}</option>
                          {availableGroups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name} ({group.members.length})
                            </option>
                          ))}
                        </AppSelect>
                        <AppButton variant="primary" leftIcon={<PlusIcon width={14} />} onClick={addGroupToOrder}>{t.modal.add}</AppButton>
                      </HStack>
                    </SurfaceCard>
                  ) : null}

                  <VStack align="stretch" spacing={5}>
                    {selectedGroups.map((group) => (
                      <SurfaceCard key={group.id} position="relative" p={3} borderRadius="13px" boxShadow="0px 1px 16.8px rgba(0,0,0,0.17)">
                        <IconButton
                          aria-label="Guruhni o'chirish"
                          size="xs"
                          variant="ghost"
                          color="#b91c1c"
                          bg="#fee2e2"
                          borderWidth="1px"
                          borderColor="#fecaca"
                          _hover={{ bg: "#fecaca", color: "#991b1b" }}
                          position="absolute"
                          top={2.5}
                          right={2.5}
                          onClick={() => removeGroupFromOrder(group.id)}
                        >
                          <TrashIcon width={15} />
                        </IconButton>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={2}>
                            <UsersIcon width={14} color="#64748b" />
                            <Text fontWeight="700" fontSize="sm" color="#0a0e1a">{group.name}</Text>
                          </HStack>
                          <Text fontSize="sm" color={uiColors.accent} fontWeight="500" pr={8}>
                            {t.modal.totalCustomers} : {group.members.length} {t.modal.customers.toLowerCase()}
                          </Text>
                        </HStack>
                        <VStack align="stretch" spacing={2}>
                          {group.members.map((member) => (
                            <Flex
                              key={`${group.id}-${member.name}-${member.phone}`}
                              justify="space-between"
                              bg="#f8fafc"
                              borderWidth="1px"
                              borderColor="#f1f5f9"
                              borderRadius="10px"
                              px={3}
                              py={2.5}
                            >
                              <Text fontSize="sm" color={uiColors.textPrimary} fontWeight="500">{member.name}</Text>
                              <Text fontSize="sm" color={uiColors.textSecondary}>{member.phone || member.email}</Text>
                            </Flex>
                          ))}
                        </VStack>
                      </SurfaceCard>
                    ))}
                  </VStack>

                  {selectedGroups.length > 0 ? (
                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3} pt={5} mt={5} borderTopWidth="1px" borderColor="#f1f5f9">
                      <Box>
                        <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryMethod}</Text>
                        <AppSelect
                          h="36px"
                          value={selectedGroups[0]?.deliveryMethod || "sms"}
                          leftIcon={(selectedGroups[0]?.deliveryMethod || "sms") === "sms" ? <PhoneIcon width={14} /> : (selectedGroups[0]?.deliveryMethod || "sms") === "email" ? <EnvelopeIcon width={14} /> : <UsersIcon width={14} />}
                          isDisabled
                        >
                          <option value="sms">{t.modal.methods.sms}</option>
                          <option value="email">{t.modal.methods.email}</option>
                          <option value="operator">{t.modal.methods.operator}</option>
                        </AppSelect>
                      </Box>
                      {(selectedGroups[0]?.deliveryMethod || "sms") !== "operator" ? (
                        <Box>
                          <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryTime}</Text>
                          <AppSelect
                            h="36px"
                            value={selectedGroups[0]?.deliveryTime || "now"}
                            leftIcon={(selectedGroups[0]?.deliveryTime || "now") === "scheduled" ? <CalendarDaysIcon width={14} /> : <ClockIcon width={14} />}
                            isDisabled
                          >
                            <option value="now">{t.modal.timeModes.now}</option>
                            <option value="scheduled">{t.modal.timeModes.scheduled}</option>
                          </AppSelect>
                        </Box>
                      ) : (
                        <Box gridColumn={{ base: "1", sm: "1 / -1" }}>
                          <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryInfo}</Text>
                          <HStack
                            borderWidth="1px"
                            borderColor="#d1d9e4"
                            borderRadius="8px"
                            bg="#f8fafc"
                            px={3}
                            py={2.5}
                            align="start"
                            spacing={2}
                          >
                            <InformationCircleIcon width={16} color="#62748e" />
                            <Text fontSize="xs" color="#62748e" lineHeight="1.4">{operatorHelperText}</Text>
                          </HStack>
                        </Box>
                      )}
                    </Grid>
                  ) : null}
                </>
              ) : (
                <>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontWeight="700" fontSize={{ base: "16px", md: "18px" }} color="#0a0a0a">{t.modal.customers} ({customers.length})</Text>
                    <AppButton variant="ghost" h="32px" borderRadius="26px" borderColor="#8294ac" borderWidth="1px" leftIcon={<PlusIcon width={14} />} onClick={addCustomer}>
                      {t.modal.addCustomer}
                    </AppButton>
                  </Flex>

                  <VStack align="stretch" spacing={5}>
                    {customers.map((customer, index) => (
                      <SurfaceCard key={customer.id} position="relative" p={6} borderRadius="13px" boxShadow="0px 1px 16.8px rgba(0,0,0,0.17)">
                        <IconButton
                          aria-label="Mijozni o'chirish"
                          size="sm"
                          variant="ghost"
                          color="#b91c1c"
                          bg="#fee2e2"
                          borderWidth="1px"
                          borderColor="#fecaca"
                          _hover={{ bg: "#fecaca", color: "#991b1b" }}
                          position="absolute"
                          top={3}
                          right={3}
                          isDisabled={customers.length <= 1}
                          opacity={customers.length <= 1 ? 0.45 : 1}
                          cursor={customers.length <= 1 ? "not-allowed" : "pointer"}
                          onClick={() => removeCustomer(customer.id)}
                        >
                          <TrashIcon width={16} />
                        </IconButton>
                        <Flex justify="space-between" align="center" mb={3}>
                          <HStack spacing={2}>
                            <Box w="24px" h="24px" borderRadius="full" bg="#ffeee8" display="grid" placeItems="center">
                              <Text color={uiColors.accent} fontWeight="700" fontSize="xs">{index + 1}</Text>
                            </Box>
                            <Text color="#314158" fontWeight="500" fontSize="sm">{t.modal.customerInfo}</Text>
                          </HStack>
                        </Flex>

                        <HStack borderWidth="1px" borderColor="#d1d9e4" borderRadius="10px" bg="#f8fafc" px={3} h="46px" spacing={2}>
                          <Box color={uiColors.textSecondary}><UserIcon width={16} /></Box>
                          <Input
                            h="100%"
                            border="none"
                            p={0}
                            bg="transparent"
                            _focusVisible={{ outline: "none", boxShadow: "none" }}
                            placeholder={t.modal.labels.fullName}
                            value={customer.fullName}
                            onChange={(event) => updateCustomer(customer.id, { fullName: event.target.value })}
                          />
                        </HStack>
                        {customer.errors.fullName ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.fullName}</Text> : null}

                        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3} pt={4} mt={4} borderTopWidth="1px" borderColor="#f1f5f9">
                          <Box>
                            <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryMethod}</Text>
                            <AppSelect
                              h="36px"
                              value={customer.deliveryMethod}
                              leftIcon={customer.deliveryMethod === "sms" ? <PhoneIcon width={14} /> : customer.deliveryMethod === "email" ? <EnvelopeIcon width={14} /> : <UsersIcon width={14} />}
                              onChange={(event) => updateCustomer(customer.id, { deliveryMethod: event.target.value })}
                            >
                              <option value="sms">{t.modal.methods.sms}</option>
                              <option value="email">{t.modal.methods.email}</option>
                              <option value="operator">{t.modal.methods.operator}</option>
                            </AppSelect>
                          </Box>

                          {customer.deliveryMethod !== "operator" ? (
                            <Box>
                              <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryTime}</Text>
                              <AppSelect
                                h="36px"
                                value={customer.deliveryTime}
                                leftIcon={customer.deliveryTime === "scheduled" ? <CalendarDaysIcon width={14} /> : <ClockIcon width={14} />}
                                onChange={(event) => updateCustomer(customer.id, { deliveryTime: event.target.value })}
                              >
                                <option value="now">{t.modal.timeModes.now}</option>
                                <option value="scheduled">{t.modal.timeModes.scheduled}</option>
                              </AppSelect>
                            </Box>
                          ) : (
                            <Box gridColumn={{ base: "1", sm: "1 / -1" }}>
                              <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryInfo}</Text>
                              <HStack
                                borderWidth="1px"
                                borderColor="#d1d9e4"
                                borderRadius="8px"
                                bg="#f8fafc"
                                px={3}
                                py={2.5}
                                align="start"
                                spacing={2}
                              >
                                <InformationCircleIcon width={16} color="#62748e" />
                                <Text fontSize="xs" color="#62748e" lineHeight="1.4">{operatorHelperText}</Text>
                              </HStack>
                            </Box>
                          )}
                        </Grid>

                        {customer.deliveryMethod !== "operator" ? (
                          <>
                            <HStack mt={3} borderWidth="1px" borderColor="#d1d9e4" borderRadius="10px" bg="#f8fafc" px={3} h="40px" spacing={2}>
                              <Box color={uiColors.textSecondary}>
                                {customer.deliveryMethod === "sms" ? <PhoneIcon width={15} /> : <EnvelopeIcon width={15} />}
                              </Box>
                              <Input
                                h="100%"
                                border="none"
                                p={0}
                                bg="transparent"
                                _focusVisible={{ outline: "none", boxShadow: "none" }}
                                placeholder={customer.deliveryMethod === "sms" ? t.modal.labels.phone : t.modal.labels.email}
                                type={customer.deliveryMethod === "sms" ? "tel" : "email"}
                                value={customer.deliveryMethod === "sms" ? customer.phone : customer.email}
                                onChange={(event) => {
                                  if (customer.deliveryMethod === "sms") {
                                    updateCustomer(customer.id, { phone: event.target.value });
                                  } else {
                                    updateCustomer(customer.id, { email: event.target.value });
                                  }
                                }}
                              />
                            </HStack>
                            {customer.deliveryMethod === "sms" && customer.errors.phone ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.phone}</Text> : null}
                            {customer.deliveryMethod === "email" && customer.errors.email ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.email}</Text> : null}
                          </>
                        ) : null}

                        {customer.deliveryMethod !== "operator" && customer.deliveryTime === "scheduled" ? (
                          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3} mt={3}>
                            <Box>
                              <Text fontSize="13px" fontWeight="600" color="#12161b" mb={1.5}>{t.modal.labels.date}</Text>
                              <Input
                                type="date"
                                h="38px"
                                borderRadius="8px"
                                borderColor="#d1d9e4"
                                bg="#f8fafc"
                                value={customer.scheduleDate}
                                onChange={(event) => updateCustomer(customer.id, { scheduleDate: event.target.value })}
                              />
                              {customer.errors.scheduleDate ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.scheduleDate}</Text> : null}
                            </Box>
                            <Box>
                              <Text fontSize="13px" fontWeight="600" color="#12161b" mb={1.5}>{t.modal.labels.time}</Text>
                              <Input
                                type="time"
                                h="38px"
                                borderRadius="8px"
                                borderColor="#d1d9e4"
                                bg="#f8fafc"
                                value={customer.scheduleTime}
                                onChange={(event) => updateCustomer(customer.id, { scheduleTime: event.target.value })}
                              />
                              {customer.errors.scheduleTime ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.scheduleTime}</Text> : null}
                            </Box>
                          </Grid>
                        ) : null}
                      </SurfaceCard>
                    ))}
                  </VStack>
                </>
              )}

              <Text mt={8} mb={4} fontWeight="700" fontSize="sm" color="#0a0a0a">{t.modal.paymentMethod}</Text>
              <Box bg="rgba(254,79,24,0.05)" borderWidth="1px" borderColor="rgba(254,79,24,0.2)" borderRadius="10px" px={3} py={4}>
                <HStack spacing={3}>
                  <Box w="38px" h="38px" borderRadius="4px" bg="white" borderWidth="1px" borderColor={uiColors.border} display="grid" placeItems="center">
                    <CreditCardIcon width={16} color={uiColors.accent} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="700" color={uiColors.textPrimary}>Visa kartasi *4242</Text>
                    <Text fontSize="xs" color={uiColors.textSecondary}>Balans: {formatMoneyFromUzs(45000000, currency)}</Text>
                  </Box>
                </HStack>
              </Box>
            </Box>

            <Box borderTopWidth="1px" borderColor={uiColors.border} bg="white" px={4} py={4}>
              <VStack align="stretch" spacing={2} mb={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="#45556c">{t.modal.summary.packagePrice} ({customerCount} ta)</Text>
                  <Text fontSize="sm" color="#45556c">{formatMoneyFromUzs(packageTotal, currency)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="#00a63e" fontWeight="600">{t.modal.summary.partnerDiscount}</Text>
                  <Text fontSize="sm" color="#00a63e">- {formatMoneyFromUzs(partnerDiscount, currency)}</Text>
                </HStack>
                <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="#f1f5f9">
                  <Text fontSize="sm" color="#45556c">{t.modal.summary.partnerProfit}</Text>
                  <Box bg="#dcfce7" borderRadius="4px" px={2} py={0.5}>
                    <Text fontSize="sm" color="#008236" fontWeight="700">{formatMoneyFromUzs(partnerProfit, currency)}</Text>
                  </Box>
                </HStack>
              </VStack>

              <HStack justify="space-between" mb={3}>
                <Text fontSize="lg" fontWeight="700" color={uiColors.textPrimary}>{t.modal.summary.total}</Text>
                <Text fontSize={{ base: "24px", md: "26px" }} fontWeight="800" lineHeight="1" color="#171717">
                  {totalPaymentParts.prefix}{totalPaymentParts.amount} <Text as="span" color="#b4b4b4" fontSize={{ base: "24px", md: "26px" }} fontWeight="600">{totalPaymentParts.code}</Text>
                </Text>
              </HStack>

              <HStack spacing={3}>
                <AppButton variant="soft" h="51px" flex="1" onClick={closeBuyModal}>{t.modal.cancel}</AppButton>
                <AppButton variant="primary" h="51px" flex="1" onClick={onConfirmBuy}>{t.modal.confirm}</AppButton>
              </HStack>
            </Box>
          </SurfaceCard>
        </Box>
      ) : null}
    </VStack>
  );
}

export default CatalogPage;
