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
import { GroupCard, GroupDetailsModal, GroupFormModal, GroupPaymentModal } from "../components/groups";
import { AppButton, AppInput, SurfaceCard } from "../components/ui";
import { pageLayout, uiColors } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";
import { useServiceData } from "../hooks/useServiceData";
import { useLocale } from "../context/LocaleContext";
import { groupsService } from "../services/groupsService";
import { plansMock } from "../mock/catalogMock";

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
    countryCode: "Davlat kodi",
    departure: "Ketish sanasi",
    return: "Qaytish sanasi",
    deliveryMethod: "eSIM yetkazib berish usuli",
    assignPackageNow: "Yaratishda paket biriktirish",
    assignPackageNowHelper: "Yoqilsa, saqlangandan keyin to'lov tasdiqlash oynasi ochiladi.",
    package: "Paket",
    packagePlaceholder: "Paketni tanlang",
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
  payment: {
    title: "Guruh to'lovi",
    package: "Paket",
    howMany: "Mijozlar soni",
    total: "Umumiy summa",
    totalDeducted: "Jami chegirma",
    subtotal: "To'lov summasi",
    payAndConfirm: "Pay and confirm"
  },
  toast: {
    createdTitle: "Guruh yaratildi",
    updatedTitle: "Guruh yangilandi",
    deletedTitle: "Guruh o'chirildi",
    packageAttachedTitle: "Paket biriktirildi",
    paymentConfirmedTitle: "To'lov tasdiqlandi",
    actionDescription: "Bu demo UI amali, backend ulanmagan"
  }
};

const gridGap = { base: 4, md: 6, lg: 8 };

function GroupsPage() {
  const { dict } = useLocale();
  const t = dict.groups || groupsFallback;
  const { toasts, pushToast } = useAppToasts();

  const [query, setQuery] = useState("");
  const [formModal, setFormModal] = useState({ isOpen: false, mode: "create", group: null });
  const [detailsGroup, setDetailsGroup] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, payment: null });

  const listParams = useMemo(() => ({ query }), [query]);
  const {
    data: groupsData,
    loading: isLoading,
    error: loadError,
    refetch
  } = useServiceData(groupsService.listGroups, listParams);
  const groups = groupsData || [];

  const showInfoToast = (title) => {
    pushToast({
      type: "success",
      title,
      description: t.toast.actionDescription
    });
  };

  const packageOptions = plansMock;

  const deliveryIcons = {
    sms: DevicePhoneMobileIcon,
    email: EnvelopeIcon,
    manual: PrinterIcon
  };

  const handleSubmitGroup = async (payload) => {
    if (!payload?.name?.trim()) {
      return;
    }
    const cleanPayload = {
      name: payload.name,
      destination: payload.destination,
      destinationCountryCode: payload.destinationCountryCode,
      travelStartDate: payload.travelStartDate,
      travelEndDate: payload.travelEndDate,
      members: payload.members,
      deliveryMethod: payload.deliveryMethod,
      deliveryTime: payload.deliveryTime
    };

    if (formModal.mode === "edit" && formModal.group?.id) {
      await groupsService.updateGroup(formModal.group.id, cleanPayload);
      showInfoToast(t.toast.updatedTitle);
    } else {
      const membersCount = Math.max(payload?.members?.length || 0, 1);
      const selectedPackage = payload?.packageSelected || null;
      const grossTotalUzs = (selectedPackage?.resellerPriceUzs || 0) * membersCount;
      const deductedUzs = Math.round(grossTotalUzs * 0.05);
      const subtotalUzs = grossTotalUzs - deductedUzs;

      const createdGroup = await groupsService.createGroup({
        ...cleanPayload,
        packageId: payload.assignPackageNow ? selectedPackage?.id : undefined,
        packageLabel: payload.assignPackageNow && selectedPackage
          ? `${selectedPackage.name} (${selectedPackage.dataLabel} / ${selectedPackage.validityDays} kun)`
          : "",
        packageStatus: payload.assignPackageNow ? "scheduled" : "unassigned",
        packageScheduledAt: payload.assignPackageNow ? new Date().toISOString() : null
      });

      if (payload.assignPackageNow && selectedPackage) {
        setPaymentModal({
          isOpen: true,
          payment: {
            groupId: createdGroup.id,
            groupName: createdGroup.name,
            packageName: selectedPackage.name,
            packageMeta: `${selectedPackage.destination} • ${selectedPackage.dataLabel} • ${selectedPackage.validityDays} kun`,
            quantity: membersCount,
            grossTotalUzs,
            deductedUzs,
            subtotalUzs
          }
        });
      } else {
        showInfoToast(t.toast.createdTitle);
      }
    }

    setFormModal({ isOpen: false, mode: "create", group: null });
    refetch();
  };

  const handleDeleteGroup = async (group) => {
    await groupsService.deleteGroup(group.id);
    showInfoToast(t.toast.deletedTitle);
    refetch();
  };

  const handleAttachPackage = async (group) => {
    const matchedPlan = packageOptions.find((item) =>
      item.destination.toLowerCase().includes((group.destination || "").toLowerCase())
    );
    await groupsService.updateGroup(group.id, {
      packageId: matchedPlan?.id || "",
      packageLabel: matchedPlan
        ? `${matchedPlan.name} (${matchedPlan.dataLabel} / ${matchedPlan.validityDays} kun)`
        : `${group.destination || "Mixed"} 10GB / 15 kun`,
      packageStatus: "scheduled",
      packageScheduledAt: new Date().toISOString()
    });
    showInfoToast(t.toast.packageAttachedTitle);
    refetch();
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
                  onAttachPackage={handleAttachPackage}
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
        onValidationError={(message) => {
          pushToast({
            type: "error",
            title: message,
            description: t.toast.actionDescription
          });
        }}
      />

      <GroupDetailsModal group={detailsGroup} t={t} onClose={() => setDetailsGroup(null)} />
      <GroupPaymentModal
        isOpen={paymentModal.isOpen}
        payment={paymentModal.payment}
        labels={{
          title: t.payment?.title || groupsFallback.payment.title,
          package: t.payment?.package || groupsFallback.payment.package,
          howMany: t.payment?.howMany || groupsFallback.payment.howMany,
          total: t.payment?.total || groupsFallback.payment.total,
          totalDeducted: t.payment?.totalDeducted || groupsFallback.payment.totalDeducted,
          subtotal: t.payment?.subtotal || groupsFallback.payment.subtotal,
          payAndConfirm: t.payment?.payAndConfirm || groupsFallback.payment.payAndConfirm,
          close: t.actions.close
        }}
        onClose={() => setPaymentModal({ isOpen: false, payment: null })}
        onConfirm={() => {
          showInfoToast(t.toast.paymentConfirmedTitle || groupsFallback.toast.paymentConfirmedTitle);
          setPaymentModal({ isOpen: false, payment: null });
        }}
      />
    </Box>
  );
}

export default GroupsPage;
