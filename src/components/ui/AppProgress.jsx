import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii, uiTransitions } from "../../design-system/tokens";

const progressVariants = {
  default: uiColors.accent,
  success: uiColors.success,
  warning: uiColors.warning,
  error: uiColors.error,
  info: uiColors.info
};

const progressSizes = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "12px"
};

export function AppProgress({
  value = 0,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  isIndeterminate = false,
  isAnimated = true
}) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const color = progressVariants[variant] || progressVariants.default;
  const height = progressSizes[size] || progressSizes.md;

  return (
    <VStack align="stretch" spacing={1.5} w="full">
      {(showLabel || label) && (
        <HStack justify="space-between">
          {label && (
            <Text fontSize="13px" fontWeight="500" color={uiColors.textSecondary}>
              {label}
            </Text>
          )}
          {showLabel && (
            <Text fontSize="12px" fontWeight="600" color={uiColors.textMuted}>
              {Math.round(percent)}%
            </Text>
          )}
        </HStack>
      )}
      <Box
        w="full"
        h={height}
        bg={uiColors.surfaceSoft}
        borderRadius={uiRadii.pill}
        overflow="hidden"
      >
        <Box
          h="full"
          w={isIndeterminate ? "40%" : `${percent}%`}
          bg={color}
          borderRadius={uiRadii.pill}
          transition={isAnimated && !isIndeterminate ? uiTransitions.standard : "none"}
          animation={isIndeterminate ? "progress-slide 1.2s ease-in-out infinite" : "none"}
          sx={{
            "@keyframes progress-slide": {
              "0%": { transform: "translateX(-100%)" },
              "100%": { transform: "translateX(350%)" }
            }
          }}
        />
      </Box>
    </VStack>
  );
}

export function AppProgressCircle({
  value = 0,
  max = 100,
  variant = "default",
  size = 64,
  strokeWidth = 6,
  showLabel = true
}) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const color = progressVariants[variant] || progressVariants.default;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <Box position="relative" display="inline-flex" w={`${size}px`} h={`${size}px`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={uiColors.surfaceSoft}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: uiTransitions.standard }}
        />
      </svg>
      {showLabel && (
        <Box
          position="absolute"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={size > 48 ? "14px" : "12px"}
            fontWeight="700"
            color={uiColors.textPrimary}
          >
            {Math.round(percent)}%
          </Text>
        </Box>
      )}
    </Box>
  );
}

export function AppProgressSteps({ steps, currentStep }) {
  return (
    <HStack spacing={2} w="full">
      {steps.map((_, idx) => (
        <Box
          key={idx}
          flex={1}
          h="4px"
          borderRadius={uiRadii.pill}
          bg={idx < currentStep ? uiColors.success : idx === currentStep ? uiColors.accent : uiColors.surfaceSoft}
          transition={uiTransitions.standard}
        />
      ))}
    </HStack>
  );
}

export default AppProgress;
