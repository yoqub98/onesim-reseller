/**
 * EsimStatusBadge - Displays eSIM status with appropriate styling
 *
 * Statuses aligned with esimAccess API:
 * - NOT_ACTIVE: Allocated but not installed
 * - IN_USE: Active and being used
 * - EXPIRED: Plan expired
 * - DEPLETED: Data exhausted
 * - CANCELLED: Cancelled
 * - FAILED: Allocation failed
 */
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { HStack, Text } from "@chakra-ui/react";
import { uiColors, uiTransitions } from "../../design-system/tokens";

const statusConfig = {
  // eSIM statuses
  NOT_ACTIVE: {
    label: "Kutilmoqda",
    labelEn: "Pending",
    bg: uiColors.warningSoft,
    color: uiColors.warning,
    icon: ClockIcon
  },
  IN_USE: {
    label: "Faol",
    labelEn: "Active",
    bg: uiColors.successSoft,
    color: uiColors.success,
    icon: CheckCircleIcon
  },
  EXPIRED: {
    label: "Muddati tugagan",
    labelEn: "Expired",
    bg: uiColors.surfaceSoft,
    color: uiColors.textMuted,
    icon: ClockIcon
  },
  DEPLETED: {
    label: "Data tugagan",
    labelEn: "Depleted",
    bg: uiColors.surfaceSoft,
    color: uiColors.textMuted,
    icon: ExclamationCircleIcon
  },
  CANCELLED: {
    label: "Bekor qilingan",
    labelEn: "Cancelled",
    bg: uiColors.errorSoft,
    color: uiColors.error,
    icon: XCircleIcon
  },
  FAILED: {
    label: "Xatolik",
    labelEn: "Failed",
    bg: uiColors.errorSoft,
    color: uiColors.error,
    icon: ExclamationCircleIcon
  },

  // Order statuses (for compatibility)
  active: {
    label: "Faol",
    labelEn: "Active",
    bg: uiColors.successSoft,
    color: uiColors.success,
    icon: CheckCircleIcon
  },
  pending: {
    label: "Kutilmoqda",
    labelEn: "Pending",
    bg: uiColors.warningSoft,
    color: uiColors.warning,
    icon: ClockIcon
  },
  completed: {
    label: "Tayyor",
    labelEn: "Completed",
    bg: uiColors.successSoft,
    color: uiColors.success,
    icon: CheckCircleIcon
  },
  failed: {
    label: "Xatolik",
    labelEn: "Failed",
    bg: uiColors.errorSoft,
    color: uiColors.error,
    icon: XCircleIcon
  },
  expired: {
    label: "Tugagan",
    labelEn: "Expired",
    bg: uiColors.surfaceSoft,
    color: uiColors.textMuted,
    icon: ClockIcon
  }
};

const sizes = {
  sm: { h: "22px", px: "8px", fontSize: "10px", iconSize: 12, gap: 1 },
  md: { h: "26px", px: "10px", fontSize: "11px", iconSize: 14, gap: 1.5 },
  lg: { h: "30px", px: "12px", fontSize: "12px", iconSize: 16, gap: 2 }
};

export function EsimStatusBadge({
  status,
  size = "md",
  showIcon = true,
  customLabel,
  lang = "uz"
}) {
  const config = statusConfig[status] || statusConfig.NOT_ACTIVE;
  const dim = sizes[size] || sizes.md;
  const IconComponent = config.icon;
  const label = customLabel || (lang === "en" ? config.labelEn : config.label);

  return (
    <HStack
      as="span"
      display="inline-flex"
      h={dim.h}
      px={dim.px}
      spacing={dim.gap}
      align="center"
      bg={config.bg}
      color={config.color}
      borderRadius="999px"
      fontWeight="600"
      fontSize={dim.fontSize}
      textTransform="uppercase"
      letterSpacing="0.02em"
      whiteSpace="nowrap"
      transition={uiTransitions.standard}
    >
      {showIcon && IconComponent && (
        <IconComponent width={dim.iconSize} strokeWidth={2.5} />
      )}
      <Text as="span">{label}</Text>
    </HStack>
  );
}

export default EsimStatusBadge;
