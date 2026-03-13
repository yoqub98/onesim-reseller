/**
 * DataUsageBar - Visual progress bar for eSIM data consumption
 *
 * Features:
 * - Color changes based on usage level (green → yellow → red)
 * - Shows used/total GB label
 * - Handles unlimited data plans
 * - Compact and detailed variants
 */
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii, uiTransitions } from "../../design-system/tokens";

// Usage thresholds for color changes
const USAGE_THRESHOLDS = {
  LOW: 50,      // 0-50% = green
  MEDIUM: 80,   // 50-80% = yellow
  HIGH: 100     // 80-100% = red
};

function getUsageColor(percent) {
  if (percent >= USAGE_THRESHOLDS.MEDIUM) {
    return uiColors.error;
  }
  if (percent >= USAGE_THRESHOLDS.LOW) {
    return uiColors.warning;
  }
  return uiColors.success;
}

function formatDataLabel(usedGb, totalGb, showRemaining = false) {
  // Handle unlimited plans
  if (totalGb === 999 || totalGb === -1 || totalGb === Infinity) {
    return `${usedGb.toFixed(1)} GB / Cheksiz`;
  }

  if (showRemaining) {
    const remaining = Math.max(totalGb - usedGb, 0);
    return `${remaining.toFixed(1)} GB qoldi`;
  }

  return `${usedGb.toFixed(1)} / ${totalGb} GB`;
}

export function DataUsageBar({
  usedGb = 0,
  totalGb = 0,
  size = "md",
  variant = "default",
  showLabel = true,
  showRemaining = false,
  labelPosition = "right"
}) {
  const isUnlimited = totalGb === 999 || totalGb === -1 || totalGb === Infinity;
  const percent = isUnlimited ? Math.min((usedGb / 50) * 100, 100) : Math.min((usedGb / totalGb) * 100, 100);
  const color = getUsageColor(isUnlimited ? 0 : percent);

  const heights = {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "10px"
  };

  const height = heights[size] || heights.md;
  const label = formatDataLabel(usedGb, totalGb, showRemaining);

  if (variant === "compact") {
    return (
      <HStack spacing={2} w="full">
        <Box flex={1} h={height} bg={uiColors.surfaceSoft} borderRadius={uiRadii.pill} overflow="hidden">
          <Box
            h="full"
            w={`${percent}%`}
            bg={color}
            borderRadius={uiRadii.pill}
            transition={uiTransitions.standard}
          />
        </Box>
        {showLabel && (
          <Text fontSize="12px" fontWeight="500" color={uiColors.textSecondary} whiteSpace="nowrap">
            {label}
          </Text>
        )}
      </HStack>
    );
  }

  if (labelPosition === "top") {
    return (
      <VStack align="stretch" spacing={1.5} w="full">
        {showLabel && (
          <HStack justify="space-between">
            <Text fontSize="12px" fontWeight="500" color={uiColors.textSecondary}>
              Data ishlatilgan
            </Text>
            <Text fontSize="12px" fontWeight="600" color={uiColors.textPrimary}>
              {label}
            </Text>
          </HStack>
        )}
        <Box w="full" h={height} bg={uiColors.surfaceSoft} borderRadius={uiRadii.pill} overflow="hidden">
          <Box
            h="full"
            w={`${percent}%`}
            bg={color}
            borderRadius={uiRadii.pill}
            transition={uiTransitions.standard}
          />
        </Box>
      </VStack>
    );
  }

  // Default: label on right
  return (
    <HStack spacing={3} w="full">
      <Box flex={1} h={height} bg={uiColors.surfaceSoft} borderRadius={uiRadii.pill} overflow="hidden">
        <Box
          h="full"
          w={`${percent}%`}
          bg={color}
          borderRadius={uiRadii.pill}
          transition={uiTransitions.standard}
        />
      </Box>
      {showLabel && (
        <Text fontSize="13px" fontWeight="600" color={uiColors.textPrimary} whiteSpace="nowrap" minW="90px" textAlign="right">
          {label}
        </Text>
      )}
    </HStack>
  );
}

/**
 * DataUsageCompact - Minimal data usage display without bar
 */
export function DataUsageCompact({ usedGb = 0, totalGb = 0 }) {
  const isUnlimited = totalGb === 999 || totalGb === -1;
  const percent = isUnlimited ? 0 : Math.round((usedGb / totalGb) * 100);
  const color = getUsageColor(percent);

  return (
    <Text fontSize="13px" fontWeight="600" color={color} fontFamily="mono">
      {isUnlimited
        ? `${usedGb.toFixed(1)} GB`
        : `${usedGb.toFixed(1)}/${totalGb} GB`
      }
    </Text>
  );
}

export default DataUsageBar;
