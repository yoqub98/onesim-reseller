import {
  CalendarDaysIcon,
  ClockIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";
import { AppButton, AppIconButton, SurfaceCard } from "../ui";

function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatSchedule(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function GroupCard({ group, t, onEdit, onDelete, onOpenDetails, onAttachPackage }) {
  const membersCount = group.members?.length || 0;
  const hasPackage = Boolean(group.packageLabel);

  return (
    <SurfaceCard
      p={5}
      borderRadius="13px"
      boxShadow="0px 2px 16.8px rgba(0,0,0,0.11)"
      borderColor="rgba(208, 215, 224, 0.7)"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="start">
          <Box>
            <Text fontSize="2xl" fontWeight="800" color={uiColors.textPrimary} lineHeight="1.2">
              {group.name}
            </Text>
            <HStack spacing={2} mt={2} align="center">
              <Badge bg={uiColors.surfaceSoft} color="#45556c" fontWeight="600" borderRadius="4px" px={2} py={0.5}>
                ID: {group.code || group.id.slice(0, 8)}
              </Badge>
              <Text color={uiColors.textSecondary} fontSize="sm">•</Text>
              <Text color={uiColors.textSecondary} fontSize="sm">{group.destination || t.labels.unknown}</Text>
            </HStack>
          </Box>

          <HStack spacing={1}>
            <AppIconButton
              variant="ghost"
              aria-label={t.actions.edit}
              icon={<PencilSquareIcon width={16} />}
              onClick={() => onEdit(group)}
            />
            <AppIconButton
              variant="ghost"
              aria-label={t.actions.delete}
              icon={<TrashIcon width={16} />}
              onClick={() => onDelete(group)}
            />
          </HStack>
        </HStack>

        <Box borderTopWidth="1px" borderColor={uiColors.border} />

        <HStack spacing={8} align="start">
          <Box minW="136px">
            <Text fontSize="xs" color={uiColors.textSecondary} textTransform="uppercase">{t.labels.departure}</Text>
            <HStack spacing={2} mt={1} color={uiColors.textPrimary}>
              <CalendarDaysIcon width={14} />
              <Text fontSize="sm" fontWeight="500">{formatDate(group.travelStartDate)}</Text>
            </HStack>
          </Box>
          <Box minW="136px">
            <Text fontSize="xs" color={uiColors.textSecondary} textTransform="uppercase">{t.labels.return}</Text>
            <HStack spacing={2} mt={1} color={uiColors.textPrimary}>
              <CalendarDaysIcon width={14} />
              <Text fontSize="sm" fontWeight="500">{formatDate(group.travelEndDate)}</Text>
            </HStack>
          </Box>
        </HStack>

        <Box borderTopWidth="1px" borderColor="#f1f5f9" pt={4}>
          {hasPackage ? (
            <Box
              bg="#f4f6f9"
              borderRadius="9px"
              px={3}
              py={2.5}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Text fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>
                {group.packageLabel}
              </Text>
              <HStack spacing={1} color={uiColors.accent} whiteSpace="nowrap">
                <ClockIcon width={12} />
                <Text fontSize="xs">{formatSchedule(group.packageScheduledAt)} {t.labels.scheduled}</Text>
              </HStack>
            </Box>
          ) : (
            <Box
              bg="#f4f6f9"
              borderRadius="9px"
              px={3}
              py={2.5}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Text color="#9ca0ac" fontWeight="500">{t.labels.unassignedPackage}</Text>
              <AppButton
                h="32px"
                variant="outline"
                color={uiColors.accent}
                borderColor="transparent"
                boxShadow="0 0 4px rgba(0,0,0,0.07)"
                bg="white"
                onClick={() => onAttachPackage(group)}
                leftIcon={<PlusIcon width={13} />}
              >
                {t.actions.attachPackage}
              </AppButton>
            </Box>
          )}
        </Box>

        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Box bg={uiColors.accentSoft} borderRadius="999px" p={1.5} color={uiColors.accent}>
              <UserGroupIcon width={14} />
            </Box>
            <Text color={uiColors.textPrimary} fontWeight="500">
              {membersCount} {t.labels.members}
            </Text>
          </HStack>
          <AppButton variant="soft" h="36px" minW="102px" onClick={() => onOpenDetails(group)}>
            {t.actions.details}
          </AppButton>
        </HStack>
      </VStack>
    </SurfaceCard>
  );
}

export default GroupCard;
