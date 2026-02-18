import {
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";
import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import AppToastStack from "../components/common/AppToastStack";
import PageHeader from "../components/layout/PageHeader";
import { GroupCard, GroupDetailsModal, GroupFormModal } from "../components/groups";
import { AppButton, AppInput, SurfaceCard } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { pageLayout, uiColors } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";
import { useServiceData } from "../hooks/useServiceData";
import { catalogService } from "../services/catalogService";
import { groupsService } from "../services/groupsService";

const groupsFallback = {
  title: "Mijozlar Guruhlari",
  subtitle: "Guruhlarni boshqarish va tezkor buyurtmalar",
  searchPlaceholder: "Qidirish: Guruh nomi, Davlat",
  empty: "Guruhlar topilmadi",
  loadError: "Guruhlarni yuklashda xatolik yuz berdi",
  actions: {
    newGroup: "Yangi Guruh",
    edit: "Tahrirlash",
    delete: "O'chirish",
    details: "Batafsil",
    attachPackage: "Paket biriktirish",
    create: "Yaratish",
    save: "Saqlash",
    saveGroup: "Сохранить группу",
    orderEsim: "Заказать eSIM",
    close: "Yopish",
    cancel: "Bekor qilish"
  },
  labels: {
    departure: "Ketish",
    return: "Qaytish",
    scheduled: "rejalashtirilgan",
    unassignedPackage: "Paket biriktirilmagan",
    members: "ta mijoz",
    membersList: "Guruh a'zolari",
    destination: "Davlat",
    esimOrderStatus: "eSIM holati",
    esimsOrdered: "eSIMs ordered",
    esimsNotOrdered: "eSIMs not ordered",
    groupStatus: {
      draft: "Draft",
      ready: "Ready",
      archived: "Archived"
    },
    unknown: "Belgilanmagan"
  },
  form: {
    createTitle: "Yangi guruh yaratish",
    editTitle: "Guruhni tahrirlash",
    helper: "Mijozlar guruhi va eSIM yetkazib berish sozlamalari",
    name: "Guruh nomi",
    namePlaceholder: "Masalan: Dubay Safari",
    destination: "Boradigan davlat",
    destinationPlaceholder: "Masalan: BAA",
    departure: "Ketish sanasi",
    return: "Qaytish sanasi",
    deliveryMethod: "eSIM yetkazib berish usuli",
    package: "Paket",
    packagePlaceholder: "Paketni tanlang",
    packageSearchPlaceholder: "Paket qidirish",
    noPackages: "Paket topilmadi",
    noPackage: "Paket biriktirmaslik",
    customers: "Mijozlar ro'yxati",
    customerName: "Ism familiya",
    customerPhone: "Telefon raqam",
    customerEmail: "Email",
    optional: "ixtiyoriy",
    membersEmpty: "Mijozlar qo'shilmagan",
    smsRequired: "SMS uchun telefon majburiy",
    emailRequired: "Email uchun email majburiy",
    requiredFields: "Guruh nomi va davlat majburiy",
    packageRequired: "Zaказ eSIM uchun paket tanlang"
  },
  toast: {
    createdTitle: "Guruh yaratildi",
    updatedTitle: "Guruh yangilandi",
    deletedTitle: "Guruh o'chirildi",
    packageAttachedTitle: "Paket biriktirildi",
    orderNotReadyTitle: "Заказ eSIM hozircha tayyor emas",
    orderNotReadyDescription: "Hozircha faqat guruhni saqlash ishlaydi.",
    actionDescription: "Ma'lumotlar bazasiga saqlandi"
  }
};

const gridGap = { base: 4, md: 6, lg: 8 };

async function loadGroupPackageOptions(params = {}) {
  const partner = params?.partner || null;
  const pageSize = 250;

  const firstPage = await catalogService.getPlans({
    partner,
    page: 1,
    pageSize
  });

  const totalCount = firstPage?.totalCount || 0;
  let plans = firstPage?.plans || [];
  let currentPage = 2;

  while (plans.length < totalCount && currentPage <= 20) {
    const nextPage = await catalogService.getPlans({
      partner,
      page: currentPage,
      pageSize
    });
    const nextPlans = nextPage?.plans || [];
    if (!nextPlans.length) {
      break;
    }

    plans = plans.concat(nextPlans);
    currentPage += 1;
  }

  const uniqueById = new Map();
  plans.forEach((plan) => {
    uniqueById.set(plan.id, plan);
  });

  return Array.from(uniqueById.values());
}

function GroupsPage() {
  const { partner } = useAuth();
  const { dict } = useLocale();
  const t = dict.groups || groupsFallback;
  const { toasts, pushToast } = useAppToasts();

  const [query, setQuery] = useState("");
  const [formModal, setFormModal] = useState({ isOpen: false, mode: "create", group: null });
  const [detailsGroup, setDetailsGroup] = useState(null);

  const listParams = useMemo(() => ({ query }), [query]);
  const {
    data: groupsData,
    loading: isLoading,
    error: loadError,
    refetch
  } = useServiceData(groupsService.listGroups, listParams);
  const groups = groupsData || [];

  const packageParams = useMemo(() => ({ partner }), [partner]);
  const { data: packageOptionsData } = useServiceData(loadGroupPackageOptions, packageParams);
  const packageOptions = packageOptionsData || [];

  const showInfoToast = (title) => {
    pushToast({
      type: "success",
      title,
      description: t.toast.actionDescription
    });
  };
  const showErrorToast = (message) => {
    pushToast({
      type: "error",
      title: message || t.loadError,
      description: t.toast.actionDescription
    });
  };

  const deliveryIcons = {
    sms: DevicePhoneMobileIcon,
    email: EnvelopeIcon,
    manual: PrinterIcon
  };

  const handleSubmitGroup = async (payload) => {
    if (!payload?.name?.trim()) {
      return;
    }

    try {
      const selectedPackage = payload?.packageSelected || null;
      const hasSelectedPackage = Boolean(selectedPackage);
      const packagePatch = hasSelectedPackage
        ? {
          packageId: selectedPackage.id,
          packageCode: selectedPackage.packageCode || selectedPackage.id,
          packageName: selectedPackage.name,
          packageDestination: selectedPackage.destination,
          packageCountryCode: selectedPackage.countryCode,
          packageDataLabel: selectedPackage.dataLabel,
          packageValidityDays: selectedPackage.validityDays,
          packageResellerPriceUzs: selectedPackage.resellerPriceUzs || 0,
          packageResellerPriceUsd: selectedPackage.resellerPriceUsd || 0,
          packageLabel: `${selectedPackage.name} (${selectedPackage.dataLabel} / ${selectedPackage.validityDays} kun)`,
          packageStatus: "assigned",
          packageScheduledAt: new Date().toISOString(),
          esimOrderStatus: formModal.group?.esimOrderStatus || "not_ordered"
        }
        : {
          packageId: "",
          packageCode: "",
          packageName: "",
          packageDestination: "",
          packageCountryCode: "",
          packageDataLabel: "",
          packageValidityDays: 0,
          packageResellerPriceUzs: 0,
          packageResellerPriceUsd: 0,
          packageLabel: "",
          packageStatus: "unassigned",
          packageScheduledAt: null,
          esimOrderStatus: "not_ordered"
        };

      const cleanPayload = {
        name: payload.name,
        destination: payload.destination,
        destinationCountryCode:
          selectedPackage?.countryCode
          || packagePatch.packageCountryCode
          || payload.destinationCountryCode,
        travelStartDate: payload.travelStartDate,
        travelEndDate: payload.travelEndDate,
        members: payload.members,
        deliveryMethod: payload.deliveryMethod,
        deliveryTime: payload.deliveryTime,
        ...packagePatch
      };

      if (formModal.mode === "edit" && formModal.group?.id) {
        await groupsService.updateGroup(formModal.group.id, cleanPayload);
        showInfoToast(t.toast.updatedTitle);
      } else {
        await groupsService.createGroup(cleanPayload);
        showInfoToast(t.toast.createdTitle);
      }

      setFormModal({ isOpen: false, mode: "create", group: null });
      refetch();
    } catch (error) {
      showErrorToast(error?.message);
    }
  };

  const handleOrderIntent = async () => {
    pushToast({
      type: "info",
      title: t.toast.orderNotReadyTitle || groupsFallback.toast.orderNotReadyTitle,
      description: t.toast.orderNotReadyDescription || groupsFallback.toast.orderNotReadyDescription
    });
  };

  const handleDeleteGroup = async (group) => {
    try {
      await groupsService.deleteGroup(group.id);
      showInfoToast(t.toast.deletedTitle);
      refetch();
    } catch (error) {
      showErrorToast(error?.message);
    }
  };

  return (
    <Box position="relative" w="full">
      <AppToastStack items={toasts} />

      <VStack align="stretch" spacing={pageLayout.sectionGap}>
        <PageHeader title={t.title} subtitle={t.subtitle}>
          <AppButton
            variant="primary"
            h="40px"
            onClick={() => setFormModal({ isOpen: true, mode: "create", group: null })}
            leftIcon={<PlusIcon width={14} />}
          >
            {t.actions.newGroup}
          </AppButton>
        </PageHeader>

        <Box>
          <AppInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            leftElement={<MagnifyingGlassIcon width={16} />}
          />
        </Box>

        {loadError ? (
          <SurfaceCard p={6}>
            <Text color="#dc2626" fontWeight="600">{loadError.message || t.loadError}</Text>
          </SurfaceCard>
        ) : null}

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={gridGap}>
            {Array.from({ length: 3 }).map((_, index) => (
              <SurfaceCard key={`group-skeleton-${index}`} p={5} minH="310px" bg={uiColors.surfaceSoft} />
            ))}
          </SimpleGrid>
        ) : null}

        {!isLoading && !loadError ? (
          groups.length ? (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={gridGap}>
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  t={t}
                  deliveryIcon={deliveryIcons[group.deliveryMethod]}
                  onEdit={(item) => setFormModal({ isOpen: true, mode: "edit", group: item })}
                  onDelete={handleDeleteGroup}
                  onOpenDetails={setDetailsGroup}
                  onAttachPackage={(item) => setFormModal({ isOpen: true, mode: "edit", group: item })}
                />
              ))}
            </SimpleGrid>
          ) : (
            <SurfaceCard p={7}>
              <Text color={uiColors.textSecondary} textAlign="center">{t.empty}</Text>
            </SurfaceCard>
          )
        ) : null}
      </VStack>

      <GroupFormModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        group={formModal.group}
        t={t}
        packageOptions={packageOptions}
        onClose={() => setFormModal({ isOpen: false, mode: "create", group: null })}
        onSubmit={handleSubmitGroup}
        onOrderIntent={handleOrderIntent}
        onValidationError={(message) => {
          pushToast({
            type: "error",
            title: message,
            description: t.toast.actionDescription
          });
        }}
      />

      <GroupDetailsModal group={detailsGroup} t={t} onClose={() => setDetailsGroup(null)} />
    </Box>
  );
}

export default GroupsPage;
