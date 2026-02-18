import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import AppToastStack from "../components/common/AppToastStack";
import PageHeader from "../components/layout/PageHeader";
import { GroupCard, GroupDetailsModal, GroupFormModal } from "../components/groups";
import { AppButton, AppInput, SurfaceCard } from "../components/ui";
import { pageLayout, uiColors } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";
import { useServiceData } from "../hooks/useServiceData";
import { useLocale } from "../context/LocaleContext";
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
    helper: "Bu modal mock, backend integration keyin ulanadi",
    name: "Guruh nomi",
    namePlaceholder: "Masalan: Dubay Safari",
    destination: "Yo'nalish",
    destinationPlaceholder: "Masalan: BAA",
    countryCode: "Davlat kodi",
    departure: "Ketish sanasi",
    return: "Qaytish sanasi",
    members: "Mijozlar",
    membersPlaceholder: "Har qator: Ism, Telefon, Email",
    membersHelper: "Misol: Ali Valiyev, +998901112233, ali@example.com"
  },
  toast: {
    createdTitle: "Guruh yaratildi",
    updatedTitle: "Guruh yangilandi",
    deletedTitle: "Guruh o'chirildi",
    packageAttachedTitle: "Paket biriktirildi",
    actionDescription: "Bu demo UI amali, backend ulanmagan"
  }
};

const gridGap = { base: 4, md: 5, lg: 6 };

function GroupsPage() {
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

  const showInfoToast = (title) => {
    pushToast({
      type: "success",
      title,
      description: t.toast.actionDescription
    });
  };

  const handleSubmitGroup = async (payload) => {
    if (!payload?.name?.trim()) {
      return;
    }

    if (formModal.mode === "edit" && formModal.group?.id) {
      await groupsService.updateGroup(formModal.group.id, payload);
      showInfoToast(t.toast.updatedTitle);
    } else {
      await groupsService.createGroup(payload);
      showInfoToast(t.toast.createdTitle);
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
    await groupsService.updateGroup(group.id, {
      packageLabel: `${group.destination || "Mixed"} 10GB / 15 kun`,
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

        <SurfaceCard p={{ base: 3, md: 4 }}>
          <AppInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            leftElement={<MagnifyingGlassIcon width={16} />}
          />
        </SurfaceCard>

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
        onClose={() => setFormModal({ isOpen: false, mode: "create", group: null })}
        onSubmit={handleSubmitGroup}
      />

      <GroupDetailsModal group={detailsGroup} t={t} onClose={() => setDetailsGroup(null)} />
    </Box>
  );
}

export default GroupsPage;
