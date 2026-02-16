import {
  ArrowRightIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  SignalIcon,
  UserCircleIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import {
  Badge,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CountryFlag from "../components/common/CountryFlag";
import StepIndicator from "../components/order/StepIndicator";
import { useCurrency } from "../context/CurrencyContext";
import { DELIVERY_EMAIL, DELIVERY_MANUAL, DELIVERY_SMS } from "../constants/delivery";
import { useFormFields } from "../hooks/useFormFields";
import { useServiceData } from "../hooks/useServiceData";
import uz from "../i18n/uz";
import { catalogService } from "../services/catalogService";
import { groupsService } from "../services/groupsService";
import { ordersService } from "../services/ordersService";
import { formatMoneyFromUsd } from "../utils/currency";

const steps = [
  { id: "plan", label: uz.order.steps.plan },
  { id: "mode", label: uz.order.steps.mode },
  { id: "checkout", label: uz.order.steps.checkout }
];
const EMPTY_LIST = [];

async function loadNewOrderData() {
  const [plans, groups] = await Promise.all([catalogService.getPlans(), groupsService.listGroups()]);
  return { plans, groups };
}

function NewOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency } = useCurrency();
  const { data: newOrderData, loading: isLoading, error: loadError } = useServiceData(loadNewOrderData);
  const plans = newOrderData?.plans || EMPTY_LIST;
  const groups = newOrderData?.groups || EMPTY_LIST;
  const error = loadError ? (loadError.message || "Yangi buyurtma sahifasi yuklanmadi") : "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState(1);

  const [selectedPlanId, setSelectedPlanId] = useState(location.state?.preselectedPlanId || "");
  const [mode, setMode] = useState("self");
  const [deliveryMethod, setDeliveryMethod] = useState(DELIVERY_SMS);
  const [scheduleType, setScheduleType] = useState("now");
  const { fields, setField } = useFormFields({
    customerName: "",
    phone: "",
    email: "",
    groupId: "",
    scheduledAt: ""
  });

  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const discount = mode === "group" && selectedPlan ? selectedPlan.price * 0.05 : 0;
  const subtotal = selectedPlan ? selectedPlan.price - discount : 0;
  const commission = selectedPlan ? subtotal * 0.12 : 0;

  const validateStep = (targetStep) => {
    if (targetStep <= step) {
      return true;
    }

    if (step === 1 && !selectedPlanId) {
      setFormError(uz.order.errors.plan);
      return false;
    }

    if (step === 2) {
      if ((mode === "customer" || mode === "self") && !fields.customerName.trim()) {
        setFormError(uz.order.errors.customerName);
        return false;
      }

      if (deliveryMethod === DELIVERY_SMS && !fields.phone.trim()) {
        setFormError(uz.order.errors.phone);
        return false;
      }

      if (deliveryMethod === DELIVERY_EMAIL && !fields.email.trim()) {
        setFormError(uz.order.errors.email);
        return false;
      }

      if (mode === "group" && !fields.groupId) {
        setFormError(uz.order.errors.group);
        return false;
      }

      if (scheduleType === "later" && !fields.scheduledAt) {
        setFormError(uz.order.errors.schedule);
        return false;
      }
    }

    setFormError("");
    return true;
  };

  const onNext = () => {
    const nextStep = Math.min(step + 1, 3);
    if (validateStep(nextStep)) {
      setStep(nextStep);
    }
  };

  const onBack = () => {
    setFormError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onCreateOrder = async () => {
    if (!validateStep(3) || !selectedPlan) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // TODO: connect to real API (checkout/order endpoint), replace mock service call
      const order = await ordersService.createOrder({
        customerName: fields.customerName || "Mening buyurtmam",
        destination: selectedPlan.destination,
        countryCode: selectedPlan.countryCode,
        planName: selectedPlan.name,
        amount: subtotal,
        commission
      });

      setSuccessMessage(`${uz.order.success}: ${order.id}`);
      setTimeout(() => {
        navigate("/orders", { state: { createdOrderId: order.id } });
      }, 800);
    } catch (err) {
      setFormError(err?.message || "Buyurtma yaratishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modeCard = (modeId, title, icon) => {
    const isActive = mode === modeId;

    return (
      <Box
        onClick={() => setMode(modeId)}
        cursor="pointer"
        borderWidth="1px"
        borderColor={isActive ? "orange.300" : "gray.200"}
        bg={isActive ? "orange.50" : "white"}
        borderRadius="lg"
        p={3}
      >
        <HStack justify="space-between">
          <HStack spacing={2}>
            {icon}
            <Text fontWeight="medium">{title}</Text>
          </HStack>
          <Badge colorScheme={isActive ? "orange" : "gray"}>{isActive ? "Tanlandi" : "Tanlash"}</Badge>
        </HStack>
      </Box>
    );
  };

  return (
    <VStack align="stretch" spacing={8} maxW="1320px" mx="auto">
      <Box>
        <Heading size="lg">{uz.order.title}</Heading>
        <Text color="gray.600" mt={1}>{uz.order.subtitle}</Text>
      </Box>

      <StepIndicator steps={steps} currentStep={step} />

      {location.state?.preselectedPlanId ? (
        <Box borderWidth="1px" borderColor="orange.200" bg="orange.50" borderRadius="lg" p={3}>
          <Text color="orange.800" fontSize="sm">{uz.order.preselected}</Text>
        </Box>
      ) : null}

      {error ? (
        <Box bg="red.50" borderColor="red.200" borderWidth="1px" borderRadius="lg" p={3}>
          <Text color="red.700" fontSize="sm">{error}</Text>
        </Box>
      ) : null}

      {formError ? (
        <Box bg="red.50" borderColor="red.200" borderWidth="1px" borderRadius="lg" p={3}>
          <Text color="red.700" fontSize="sm">{formError}</Text>
        </Box>
      ) : null}

      {successMessage ? (
        <Box bg="green.50" borderColor="green.200" borderWidth="1px" borderRadius="lg" p={3}>
          <HStack spacing={2}>
            <CheckCircleIcon width={18} color="#16A34A" />
            <Text color="green.700" fontSize="sm">{successMessage}</Text>
          </HStack>
        </Box>
      ) : null}

      {isLoading ? (
        <VStack align="stretch" spacing={3}>
          <Skeleton h="120px" borderRadius="lg" />
          <Skeleton h="120px" borderRadius="lg" />
          <Skeleton h="120px" borderRadius="lg" />
        </VStack>
      ) : null}

      {!isLoading && step === 1 ? (
        <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
          <Text fontWeight="semibold" mb={3}>{uz.order.steps.plan}</Text>
          <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={3}>
            {plans.map((plan) => {
              const isActive = selectedPlanId === plan.id;

              return (
                <Box
                  key={plan.id}
                  borderWidth="1px"
                  borderColor={isActive ? "orange.300" : "gray.200"}
                  bg={isActive ? "orange.50" : "white"}
                  borderRadius="lg"
                  p={3}
                  cursor="pointer"
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <HStack justify="space-between" align="start">
                    <HStack spacing={2}>
                      <CountryFlag code={plan.countryCode} size={18} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{plan.name}</Text>
                        <Text fontSize="sm" color="gray.600">{plan.destination}</Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme={isActive ? "orange" : "gray"}>{isActive ? "Tanlandi" : "Tanlash"}</Badge>
                  </HStack>

                  <HStack mt={2} spacing={2}>
                    <Badge colorScheme="orange">{plan.dataGb} GB</Badge>
                    <Badge colorScheme="blue">{plan.validityDays} kun</Badge>
                    <Badge>{plan.coverage}</Badge>
                  </HStack>

                  <Text mt={2} fontWeight="bold">{formatMoneyFromUsd(plan.price, currency)}</Text>
                </Box>
              );
            })}
          </Grid>
        </Box>
      ) : null}

      {!isLoading && step === 2 ? (
        <VStack align="stretch" spacing={4}>
          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
            <Text fontWeight="semibold" mb={3}>{uz.order.modeTitle}</Text>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
              {modeCard("self", uz.order.modes.self, <UserCircleIcon width={18} />)}
              {modeCard("customer", uz.order.modes.customer, <DevicePhoneMobileIcon width={18} />)}
              {modeCard("group", uz.order.modes.group, <UserGroupIcon width={18} />)}
            </Grid>
          </Box>

          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
            <Text fontWeight="semibold" mb={3}>Mijoz ma'lumotlari</Text>

            {(mode === "self" || mode === "customer") ? (
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>{uz.order.fields.customerName}</Text>
                  <Box
                    as="input"
                    w="100%"
                    h="40px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    px={3}
                    value={fields.customerName}
                    onChange={(event) => setField("customerName", event.target.value)}
                  />
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>{uz.order.fields.phone}</Text>
                  <Box
                    as="input"
                    w="100%"
                    h="40px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    px={3}
                    placeholder="998901234567"
                    value={fields.phone}
                    onChange={(event) => setField("phone", event.target.value)}
                  />
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>{uz.order.fields.email}</Text>
                  <Box
                    as="input"
                    w="100%"
                    h="40px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    px={3}
                    value={fields.email}
                    onChange={(event) => setField("email", event.target.value)}
                  />
                </Box>
              </Grid>
            ) : (
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>{uz.order.fields.group}</Text>
                <Box
                  as="select"
                  w="100%"
                  h="40px"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  px={2}
                  value={fields.groupId}
                  onChange={(event) => setField("groupId", event.target.value)}
                >
                  <option value="">Guruh tanlang</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name} ({group.members.length})</option>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
            <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
              <Text fontWeight="semibold" mb={3}>{uz.order.fields.deliveryMethod}</Text>
              <VStack align="stretch" spacing={2}>
                <Button
                  variant={deliveryMethod === DELIVERY_SMS ? "solid" : "outline"}
                  bg={deliveryMethod === DELIVERY_SMS ? "#FE4F18" : "transparent"}
                  color={deliveryMethod === DELIVERY_SMS ? "white" : "gray.800"}
                  _hover={{ bg: deliveryMethod === DELIVERY_SMS ? "#e74716" : "gray.50" }}
                  leftIcon={<DevicePhoneMobileIcon width={16} />}
                  onClick={() => setDeliveryMethod(DELIVERY_SMS)}
                >
                  {uz.order.delivery.sms}
                </Button>
                <Button
                  variant={deliveryMethod === DELIVERY_EMAIL ? "solid" : "outline"}
                  bg={deliveryMethod === DELIVERY_EMAIL ? "#FE4F18" : "transparent"}
                  color={deliveryMethod === DELIVERY_EMAIL ? "white" : "gray.800"}
                  _hover={{ bg: deliveryMethod === DELIVERY_EMAIL ? "#e74716" : "gray.50" }}
                  leftIcon={<EnvelopeIcon width={16} />}
                  onClick={() => setDeliveryMethod(DELIVERY_EMAIL)}
                >
                  {uz.order.delivery.email}
                </Button>
                <Button
                  variant={deliveryMethod === DELIVERY_MANUAL ? "solid" : "outline"}
                  bg={deliveryMethod === DELIVERY_MANUAL ? "#FE4F18" : "transparent"}
                  color={deliveryMethod === DELIVERY_MANUAL ? "white" : "gray.800"}
                  _hover={{ bg: deliveryMethod === DELIVERY_MANUAL ? "#e74716" : "gray.50" }}
                  leftIcon={<UserCircleIcon width={16} />}
                  onClick={() => setDeliveryMethod(DELIVERY_MANUAL)}
                >
                  {uz.order.delivery.manual}
                </Button>
              </VStack>
            </Box>

            <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
              <Text fontWeight="semibold" mb={3}>{uz.order.fields.schedule}</Text>
              <VStack align="stretch" spacing={2}>
                <Button
                  variant={scheduleType === "now" ? "solid" : "outline"}
                  bg={scheduleType === "now" ? "#FE4F18" : "transparent"}
                  color={scheduleType === "now" ? "white" : "gray.800"}
                  _hover={{ bg: scheduleType === "now" ? "#e74716" : "gray.50" }}
                  leftIcon={<CheckCircleIcon width={16} />}
                  onClick={() => setScheduleType("now")}
                >
                  {uz.order.schedule.now}
                </Button>
                <Button
                  variant={scheduleType === "later" ? "solid" : "outline"}
                  bg={scheduleType === "later" ? "#FE4F18" : "transparent"}
                  color={scheduleType === "later" ? "white" : "gray.800"}
                  _hover={{ bg: scheduleType === "later" ? "#e74716" : "gray.50" }}
                  leftIcon={<CalendarDaysIcon width={16} />}
                  onClick={() => setScheduleType("later")}
                >
                  {uz.order.schedule.later}
                </Button>

                {scheduleType === "later" ? (
                  <Box
                    as="input"
                    type="datetime-local"
                    w="100%"
                    h="40px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    px={3}
                    value={fields.scheduledAt}
                    onChange={(event) => setField("scheduledAt", event.target.value)}
                  />
                ) : null}
              </VStack>
            </Box>
          </Grid>
        </VStack>
      ) : null}

      {!isLoading && step === 3 ? (
        <Grid templateColumns={{ base: "1fr", lg: "1.3fr 1fr" }} gap={4}>
          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
            <Text fontWeight="semibold" mb={3}>Buyurtma ma'lumotlari</Text>
            {selectedPlan ? (
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text color="gray.600">Tarif</Text>
                  <HStack spacing={2}>
                    <CountryFlag code={selectedPlan.countryCode} size={14} />
                    <Text fontWeight="medium">{selectedPlan.name}</Text>
                  </HStack>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Yo'nalish</Text>
                  <HStack spacing={2}>
                    <CountryFlag code={selectedPlan.countryCode} size={14} />
                    <Text>{selectedPlan.destination}</Text>
                  </HStack>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Rejim</Text>
                  <Badge colorScheme="orange">{uz.order.modes[mode]}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Yetkazish</Text>
                  <Text>{uz.order.delivery[deliveryMethod]}</Text>
                </HStack>
              </VStack>
            ) : (
              <Text color="gray.600">Tarif tanlanmagan</Text>
            )}
          </Box>

          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
            <Text fontWeight="semibold" mb={3}>{uz.order.summary.title}</Text>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <HStack spacing={1}><SignalIcon width={16} /><Text>{uz.order.summary.price}</Text></HStack>
                <Text>{formatMoneyFromUsd(selectedPlan ? selectedPlan.price : 0, currency)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>{uz.order.summary.discount}</Text>
                <Text color="green.600">- {formatMoneyFromUsd(discount, currency)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>{uz.order.summary.subtotal}</Text>
                <Text fontWeight="semibold">{formatMoneyFromUsd(subtotal, currency)}</Text>
              </HStack>
              <HStack justify="space-between">
                <HStack spacing={1}><BanknotesIcon width={16} /><Text>{uz.order.summary.commission}</Text></HStack>
                <Text color="orange.600">{formatMoneyFromUsd(commission, currency)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>{uz.order.summary.payment}</Text>
                <Badge colorScheme="gray">{uz.order.summary.paymentValue}</Badge>
              </HStack>
            </VStack>

            <Button
              mt={4}
              w="100%"
              bg="#FE4F18"
              color="white"
              _hover={{ bg: "#e74716" }}
              onClick={onCreateOrder}
              isDisabled={isSubmitting}
              rightIcon={<ArrowRightIcon width={16} />}
            >
              {isSubmitting ? uz.order.creating : uz.order.create}
            </Button>
          </Box>
        </Grid>
      ) : null}

      {!isLoading ? (
        <HStack justify="space-between" pt={1}>
          <Button variant="outline" onClick={onBack} isDisabled={step === 1 || isSubmitting}>
            {uz.common.back}
          </Button>

          {step < 3 ? (
            <Button bg="#FE4F18" color="white" _hover={{ bg: "#e74716" }} onClick={onNext}>
              {uz.common.next}
            </Button>
          ) : null}
        </HStack>
      ) : null}
    </VStack>
  );
}

export default NewOrderPage;
