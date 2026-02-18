import {
  ChevronDownIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PrinterIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DELIVERY_EMAIL, DELIVERY_MANUAL, DELIVERY_SMS } from "../../constants/delivery";
import { uiColors } from "../../design-system/tokens";
import {
  AppButton,
  AppIconButton,
  AppInput,
  AppSwitch,
  PackageDisplay,
  SurfaceCard
} from "../ui";

const DELIVERY_OPTIONS = [
  { value: DELIVERY_SMS, label: "SMS orqali", icon: DevicePhoneMobileIcon },
  { value: DELIVERY_EMAIL, label: "Email orqali", icon: EnvelopeIcon },
  { value: DELIVERY_MANUAL, label: "Qo'lda beraman", icon: PrinterIcon }
];

function getDefaultPhoneByDelivery(method) {
  return method === DELIVERY_SMS ? "+998" : "";
}

function sanitizeMember(member) {
  const phone = String(member?.phone || "").trim();
  const email = String(member?.email || "").trim();
  return {
    name: String(member?.name || "").trim(),
    phone: phone === "+998" ? "" : phone,
    email
  };
}

function PackagePickerSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  onChange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selectedPackage = useMemo(
    () => options.find((item) => item.id === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const normalized = query.trim().toLowerCase();
    return options.filter((item) => {
      const searchable = [
        item.name,
        item.destination,
        item.countryCode,
        item.dataLabel,
        `${item.validityDays || 0}`
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalized);
    });
  }, [options, query]);

  useEffect(() => {
    function onOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  return (
    <Box ref={containerRef} position="relative">
      <SurfaceCard
        as="button"
        type="button"
        w="full"
        minH="54px"
        p={2.5}
        borderRadius="10px"
        borderColor={isOpen ? uiColors.accent : uiColors.borderStrong}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <HStack justify="space-between" spacing={3}>
          {selectedPackage ? (
            <PackageDisplay
              countryCode={selectedPackage.countryCode}
              destination={selectedPackage.destination || selectedPackage.name}
              dataLabel={`${selectedPackage.dataLabel || "-"} - ${selectedPackage.validityDays || 0} kun`}
              flagSize={28}
            />
          ) : (
            <Text color={uiColors.textSecondary} fontSize="sm" textAlign="left">
              {placeholder}
            </Text>
          )}
          <Box color={uiColors.textSecondary}>
            <ChevronDownIcon width={16} />
          </Box>
        </HStack>
      </SurfaceCard>

      {isOpen ? (
        <SurfaceCard
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          zIndex={70}
          borderRadius="10px"
          p={2.5}
          boxShadow="0px 12px 30px rgba(15, 23, 43, 0.16)"
        >
          <Box position="relative">
            <Box position="absolute" left={2.5} top="50%" transform="translateY(-50%)" color={uiColors.textSecondary}>
              <MagnifyingGlassIcon width={14} />
            </Box>
            <Input
              h="36px"
              pl={8}
              borderColor={uiColors.borderStrong}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Box>

          <VStack mt={2.5} align="stretch" spacing={1.5} maxH="240px" overflowY="auto">
            {filteredOptions.length ? (
              filteredOptions.map((item) => (
                <SurfaceCard
                  key={item.id}
                  as="button"
                  type="button"
                  textAlign="left"
                  p={2.5}
                  borderRadius="8px"
                  borderColor={item.id === value ? uiColors.accent : uiColors.border}
                  bg={item.id === value ? uiColors.accentSoft : "white"}
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <HStack justify="space-between" align="start">
                    <PackageDisplay
                      countryCode={item.countryCode}
                      destination={item.destination || item.name}
                      dataLabel={`${item.dataLabel || "-"} - ${item.validityDays || 0} kun`}
                      flagSize={24}
                      titleSize="sm"
                      subtitleSize="xs"
                    />
                    <Text fontSize="xs" color={uiColors.textSecondary}>
                      {item.name}
                    </Text>
                  </HStack>
                </SurfaceCard>
              ))
            ) : (
              <Text py={2} textAlign="center" fontSize="sm" color={uiColors.textMuted}>
                {emptyLabel}
              </Text>
            )}
          </VStack>
        </SurfaceCard>
      ) : null}
    </Box>
  );
}

function GroupFormModal({
  isOpen,
  mode,
  group,
  t,
  packageOptions = [],
  onClose,
  onSubmit,
  onValidationError
}) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationCountryCode, setDestinationCountryCode] = useState("");
  const [travelStartDate, setTravelStartDate] = useState("");
  const [travelEndDate, setTravelEndDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState(DELIVERY_SMS);
  const [assignPackageNow, setAssignPackageNow] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [members, setMembers] = useState([]);
  const [memberInput, setMemberInput] = useState({
    name: "",
    phone: getDefaultPhoneByDelivery(DELIVERY_SMS),
    email: ""
  });

  const actions = {
    ...{
      create: "Yaratish",
      save: "Saqlash",
      cancel: "Bekor qilish",
      close: "Yopish",
      add: "Qo'shish",
      remove: "O'chirish"
    },
    ...(t?.actions || {})
  };
  const form = {
    ...{
      createTitle: "Yangi guruh yaratish",
      editTitle: "Guruhni tahrirlash",
      helper: "Mijozlar guruhi va eSIM yetkazib berish sozlamalari",
      name: "Guruh nomi",
      namePlaceholder: "Masalan: Dubay safari",
      destination: "Boradigan davlat",
      destinationPlaceholder: "Masalan: BAA",
      departure: "Ketish sanasi",
      return: "Qaytish sanasi",
      deliveryMethod: "eSIM yetkazib berish usuli",
      assignPackageNow: "Yaratishda paket biriktirish",
      assignPackageNowHelper: "Yoqilsa, saqlangandan keyin to'lov tasdiqlash oynasi ochiladi.",
      package: "Paket",
      packagePlaceholder: "Paketni tanlang",
      packageSearchPlaceholder: "Paket qidirish",
      noPackages: "Paket topilmadi",
      customers: "Mijozlar ro'yxati",
      customerName: "Ism familiya",
      customerPhone: "Telefon raqam",
      customerEmail: "Email",
      optional: "ixtiyoriy",
      membersEmpty: "Mijozlar qo'shilmagan",
      smsRequired: "SMS uchun telefon majburiy",
      emailRequired: "Email uchun email majburiy",
      requiredFields: "Guruh nomi va davlat majburiy",
      packageRequired: "Paketni tanlang yoki paket biriktirishni o'chiring"
    },
    ...(t?.form || {})
  };

  useEffect(() => {
    if (!isOpen) return;

    setName(group?.name || "");
    setDestination(group?.destination || "");
    setDestinationCountryCode(group?.destinationCountryCode || "");
    setTravelStartDate(group?.travelStartDate || "");
    setTravelEndDate(group?.travelEndDate || "");
    setDeliveryMethod(group?.deliveryMethod || DELIVERY_SMS);
    setAssignPackageNow(Boolean(group?.packageId || group?.forceAssignPackageNow));
    setSelectedPackageId(group?.packageId || "");
    setMembers(group?.members || []);
    setMemberInput({
      name: "",
      phone: getDefaultPhoneByDelivery(group?.deliveryMethod || DELIVERY_SMS),
      email: ""
    });
  }, [group, isOpen]);

  const modalTitle = useMemo(
    () => (mode === "edit" ? form.editTitle : form.createTitle),
    [mode, form.createTitle, form.editTitle]
  );

  const selectedPackage = useMemo(
    () => packageOptions.find((item) => item.id === selectedPackageId) || null,
    [packageOptions, selectedPackageId]
  );

  useEffect(() => {
    if (!assignPackageNow || !selectedPackage) return;
    if (!destination.trim() && selectedPackage.destination) {
      setDestination(selectedPackage.destination);
    }
    if (selectedPackage.countryCode && selectedPackage.countryCode !== destinationCountryCode) {
      setDestinationCountryCode(String(selectedPackage.countryCode).toUpperCase());
    }
  }, [assignPackageNow, destination, destinationCountryCode, selectedPackage]);

  useEffect(() => {
    setMemberInput((prev) => {
      if (deliveryMethod === DELIVERY_SMS) {
        if (!prev.phone) {
          return { ...prev, phone: "+998" };
        }
        return prev;
      }
      if (prev.phone === "+998") {
        return { ...prev, phone: "" };
      }
      return prev;
    });
  }, [deliveryMethod]);

  if (!isOpen) return null;

  const notifyError = (message) => {
    if (onValidationError) onValidationError(message);
  };

  const addMember = () => {
    const nextMember = sanitizeMember(memberInput);
    if (!nextMember.name) {
      notifyError(form.customerName);
      return;
    }
    if (deliveryMethod === DELIVERY_SMS && !nextMember.phone) {
      notifyError(form.smsRequired);
      return;
    }
    if (deliveryMethod === DELIVERY_EMAIL && !nextMember.email) {
      notifyError(form.emailRequired);
      return;
    }

    setMembers((prev) => [...prev, nextMember]);
    setMemberInput({
      name: "",
      phone: getDefaultPhoneByDelivery(deliveryMethod),
      email: ""
    });
  };

  const handleSubmit = () => {
    if (!name.trim() || !destination.trim()) {
      notifyError(form.requiredFields);
      return;
    }
    if (assignPackageNow && !selectedPackageId) {
      notifyError(form.packageRequired);
      return;
    }

    const sanitizedMembers = members.map((member) => sanitizeMember(member));
    const hasInvalidMember = sanitizedMembers.some((member) => {
      if (!member.name) return true;
      if (deliveryMethod === DELIVERY_SMS && !member.phone) return true;
      if (deliveryMethod === DELIVERY_EMAIL && !member.email) return true;
      return false;
    });

    if (hasInvalidMember) {
      notifyError(
        deliveryMethod === DELIVERY_SMS
          ? form.smsRequired
          : deliveryMethod === DELIVERY_EMAIL
            ? form.emailRequired
            : form.customerName
      );
      return;
    }

    onSubmit({
      id: group?.id,
      name,
      destination,
      destinationCountryCode,
      travelStartDate,
      travelEndDate,
      members: sanitizedMembers,
      deliveryMethod,
      deliveryTime: "now",
      assignPackageNow,
      packageId: selectedPackageId || undefined,
      packageSelected: selectedPackage
    });
  };

  return (
    <>
      <Box position="fixed" inset={0} bg="rgba(15, 23, 43, 0.48)" backdropFilter="blur(2px)" zIndex={40} onClick={onClose} />
      <Box position="fixed" inset={0} zIndex={50} display="grid" placeItems="center" p={4}>
        <SurfaceCard w="full" maxW="860px" borderRadius="14px" overflow="hidden">
          <HStack px={5} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <Box>
              <Text fontWeight="800" fontSize="xl" color={uiColors.textPrimary}>{modalTitle}</Text>
              <Text fontSize="sm" color={uiColors.textSecondary}>{form.helper}</Text>
            </Box>
            <AppIconButton variant="ghost" aria-label={actions.close} icon={<XMarkIcon width={18} />} onClick={onClose} />
          </HStack>

          <VStack align="stretch" spacing={5} p={5} maxH="72vh" overflowY="auto">
            <Box>
              <Text mb={2} fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>{form.deliveryMethod}</Text>
              <HStack align="stretch" spacing={3}>
                {DELIVERY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = deliveryMethod === option.value;
                  return (
                    <SurfaceCard
                      key={option.value}
                      as="button"
                      type="button"
                      onClick={() => setDeliveryMethod(option.value)}
                      flex="1"
                      p={3}
                      bg={isActive ? uiColors.accentSoft : "white"}
                      borderColor={isActive ? uiColors.accent : uiColors.border}
                    >
                      <VStack spacing={2}>
                        <Box color={isActive ? uiColors.accent : uiColors.textSecondary}>
                          <Icon width={20} />
                        </Box>
                        <Text fontSize="sm" fontWeight="600" color={isActive ? uiColors.accent : uiColors.textPrimary}>
                          {option.label}
                        </Text>
                      </VStack>
                    </SurfaceCard>
                  );
                })}
              </HStack>
            </Box>

            <Box borderTopWidth="1px" borderColor={uiColors.border} pt={5}>
              <HStack align="start" spacing={3}>
                <AppInput
                  label={form.name}
                  placeholder={form.namePlaceholder}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  containerProps={{ flex: 1 }}
                />
                <AppInput
                  label={form.destination}
                  placeholder={form.destinationPlaceholder}
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  containerProps={{ flex: 1 }}
                />
              </HStack>
              <HStack align="start" spacing={3} mt={3}>
                <AppInput
                  label={form.departure}
                  type="date"
                  value={travelStartDate}
                  onChange={(event) => setTravelStartDate(event.target.value)}
                  containerProps={{ flex: 1 }}
                />
                <AppInput
                  label={form.return}
                  type="date"
                  value={travelEndDate}
                  onChange={(event) => setTravelEndDate(event.target.value)}
                  containerProps={{ flex: 1 }}
                />
              </HStack>
            </Box>

            <Box borderTopWidth="1px" borderColor={uiColors.border} pt={5}>
              <AppSwitch
                label={form.assignPackageNow}
                description={form.assignPackageNowHelper}
                isChecked={assignPackageNow}
                onChange={(event) => setAssignPackageNow(event.target.checked)}
              />
              {assignPackageNow ? (
                <Box mt={3}>
                  <Text mb={2} fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>{form.package}</Text>
                  <PackagePickerSelect
                    value={selectedPackageId}
                    options={packageOptions}
                    placeholder={form.packagePlaceholder}
                    searchPlaceholder={form.packageSearchPlaceholder}
                    emptyLabel={form.noPackages}
                    onChange={setSelectedPackageId}
                  />
                </Box>
              ) : null}
            </Box>

            <Box borderTopWidth="1px" borderColor={uiColors.border} pt={5}>
              <Text fontSize="sm" fontWeight="700" color={uiColors.textPrimary} mb={3}>
                {form.customers} ({members.length})
              </Text>

              <SurfaceCard p={3.5} bg={uiColors.surfaceSoft}>
                <HStack align="start" spacing={2.5}>
                  <AppInput
                    placeholder={form.customerName}
                    value={memberInput.name}
                    onChange={(event) => setMemberInput((prev) => ({ ...prev, name: event.target.value }))}
                    containerProps={{ flex: 1.25 }}
                  />
                  <AppInput
                    placeholder={
                      deliveryMethod === DELIVERY_EMAIL
                        ? form.customerEmail
                        : `${form.customerEmail} (${form.optional})`
                    }
                    value={memberInput.email}
                    onChange={(event) => setMemberInput((prev) => ({ ...prev, email: event.target.value }))}
                    containerProps={{ flex: 1 }}
                  />
                  <AppInput
                    placeholder={
                      deliveryMethod === DELIVERY_SMS
                        ? form.customerPhone
                        : `${form.customerPhone} (${form.optional})`
                    }
                    value={memberInput.phone}
                    onChange={(event) => setMemberInput((prev) => ({ ...prev, phone: event.target.value }))}
                    containerProps={{ flex: 1 }}
                  />
                  <AppButton h="44px" variant="primary" onClick={addMember} leftIcon={<PlusIcon width={14} />}>
                    {actions.add}
                  </AppButton>
                </HStack>

                <VStack mt={3} align="stretch" spacing={2} maxH="190px" overflowY="auto">
                  {members.length ? (
                    members.map((member, index) => (
                      <HStack key={`${member.name}-${index}`} bg="white" borderRadius="8px" px={3} py={2.5} justify="space-between">
                        <Text flex="1" fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>{member.name}</Text>
                        <Text flex="1" fontSize="sm" color={uiColors.textSecondary} noOfLines={1}>{member.email || "--"}</Text>
                        <Text flex="1" fontSize="sm" color={uiColors.textSecondary} noOfLines={1}>{member.phone || "--"}</Text>
                        <AppIconButton
                          variant="ghost"
                          aria-label={actions.remove}
                          icon={<TrashIcon width={14} />}
                          onClick={() => setMembers((prev) => prev.filter((_, memberIndex) => memberIndex !== index))}
                        />
                      </HStack>
                    ))
                  ) : (
                    <Text py={2} textAlign="center" fontSize="sm" color={uiColors.textMuted}>
                      {form.membersEmpty}
                    </Text>
                  )}
                </VStack>
              </SurfaceCard>
            </Box>
          </VStack>

          <HStack px={5} py={4} borderTopWidth="1px" borderColor={uiColors.border} justify="end" bg={uiColors.surfaceSoft}>
            <AppButton onClick={onClose}>{actions.cancel}</AppButton>
            <AppButton variant="primary" onClick={handleSubmit}>
              {mode === "edit" ? actions.save : assignPackageNow ? "To'lovga o'tish" : actions.create}
            </AppButton>
          </HStack>
        </SurfaceCard>
      </Box>
    </>
  );
}

export default GroupFormModal;

