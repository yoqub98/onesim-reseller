import { Box, HStack, Text } from "@chakra-ui/react";
import { uiColors, uiTransitions } from "../../design-system/tokens";

const badgeVariants = {
  default: {
    bg: uiColors.surfaceSoft,
    color: uiColors.textSecondary,
    borderColor: uiColors.border
  },
  primary: {
    bg: uiColors.accentSoft,
    color: uiColors.accent,
    borderColor: "transparent"
  },
  success: {
    bg: uiColors.successSoft,
    color: uiColors.success,
    borderColor: "transparent"
  },
  warning: {
    bg: uiColors.warningSoft,
    color: uiColors.warning,
    borderColor: "transparent"
  },
  error: {
    bg: uiColors.errorSoft,
    color: uiColors.error,
    borderColor: "transparent"
  },
  info: {
    bg: uiColors.infoSoft,
    color: uiColors.info,
    borderColor: "transparent"
  },
  outline: {
    bg: "transparent",
    color: uiColors.textSecondary,
    borderColor: uiColors.borderStrong
  }
};

const badgeSizes = {
  sm: { h: "20px", px: "6px", fontSize: "10px", dotSize: "6px" },
  md: { h: "24px", px: "8px", fontSize: "11px", dotSize: "6px" },
  lg: { h: "28px", px: "10px", fontSize: "12px", dotSize: "8px" }
};

export function AppBadge({
  children,
  variant = "default",
  size = "md",
  leftIcon,
  rightIcon,
  dot,
  dotColor,
  isRounded = false
}) {
  const style = badgeVariants[variant] || badgeVariants.default;
  const dim = badgeSizes[size] || badgeSizes.md;

  return (
    <HStack
      as="span"
      display="inline-flex"
      h={dim.h}
      px={dim.px}
      spacing={1.5}
      align="center"
      bg={style.bg}
      color={style.color}
      borderRadius={isRounded ? "999px" : "6px"}
      border="1px solid"
      borderColor={style.borderColor}
      fontWeight="600"
      fontSize={dim.fontSize}
      textTransform="uppercase"
      letterSpacing="0.02em"
      whiteSpace="nowrap"
      transition={uiTransitions.standard}
    >
      {dot && (
        <Box
          w={dim.dotSize}
          h={dim.dotSize}
          borderRadius="50%"
          bg={dotColor || style.color}
          flexShrink={0}
        />
      )}
      {leftIcon && (
        <Box as="span" display="inline-flex" alignItems="center" flexShrink={0}>
          {leftIcon}
        </Box>
      )}
      <Text as="span">{children}</Text>
      {rightIcon && (
        <Box as="span" display="inline-flex" alignItems="center" flexShrink={0}>
          {rightIcon}
        </Box>
      )}
    </HStack>
  );
}

export function AppCountBadge({ count, max = 99, variant = "error", size = "sm" }) {
  const style = badgeVariants[variant] || badgeVariants.error;
  const displayCount = count > max ? `${max}+` : count;
  const isSmall = count < 10;

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      minW={isSmall ? "18px" : "auto"}
      h="18px"
      px={isSmall ? 0 : "6px"}
      borderRadius="999px"
      bg={style.bg === "transparent" ? uiColors.error : style.color}
      color="white"
      fontSize="11px"
      fontWeight="700"
    >
      {displayCount}
    </Box>
  );
}

export default AppBadge;
