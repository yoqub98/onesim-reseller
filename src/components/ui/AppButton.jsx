import { Box, Button, HStack, IconButton } from "@chakra-ui/react";
import { uiColors, uiControlSizes, uiRadii, uiShadows, uiTransitions } from "../../design-system/tokens";

const baseButtonStyles = {
  borderRadius: uiRadii.md,
  fontWeight: "600",
  color: uiColors.textPrimary,
  borderColor: uiColors.borderStrong,
  transition: uiTransitions.standard,
  _hover: { bg: uiColors.surfaceSoft, borderColor: uiColors.borderStrong, transform: "translateY(-0.5px)" },
  _active: { transform: "translateY(0)" },
  _focusVisible: {
    outline: "none",
    boxShadow: uiShadows.focus
  }
};

const buttonVariants = {
  primary: {
    bg: uiColors.accent,
    color: "white",
    borderColor: uiColors.accent,
    _hover: { bg: uiColors.accentHover, borderColor: uiColors.accentHover }
  },
  dark: {
    bg: uiColors.textPrimary,
    color: "white",
    borderColor: uiColors.textPrimary,
    _hover: { bg: "#1e293b", borderColor: "#1e293b" }
  },
  outline: {
    bg: "transparent",
    borderColor: uiColors.accent,
    color: uiColors.textPrimary,
    _hover: { bg: uiColors.accentSoft, borderColor: uiColors.accentHover }
  },
  soft: {
    bg: uiColors.surfaceSoft,
    color: "#314158",
    borderColor: uiColors.border,
    _hover: { bg: "#e8edf4" }
  },
  ghost: {
    bg: "transparent",
    borderColor: "transparent",
    color: uiColors.textSecondary,
    _hover: { bg: uiColors.surfaceSoft, color: uiColors.textPrimary }
  },
  danger: {
    bg: uiColors.error,
    color: "white",
    borderColor: uiColors.error,
    _hover: { bg: "#b91c1c", borderColor: "#b91c1c" }
  },
  success: {
    bg: uiColors.success,
    color: "white",
    borderColor: uiColors.success,
    _hover: { bg: "#15803d", borderColor: "#15803d" }
  }
};

export function AppButton({
  variant = "soft",
  size = "sm",
  children,
  leftIcon,
  rightIcon,
  startElement,
  endElement,
  ...props
}) {
  const resolvedStartElement = startElement ?? leftIcon;
  const resolvedEndElement = endElement ?? rightIcon;
  const hasIcon = Boolean(resolvedStartElement || resolvedEndElement);
  const controlSize = uiControlSizes[size] || uiControlSizes.sm;
  const resolvedVariant = buttonVariants[variant] || buttonVariants.soft;

  return (
    <Button
      h={controlSize.h}
      px={controlSize.px}
      fontSize={controlSize.fontSize}
      borderWidth="1px"
      boxShadow={variant === "ghost" || variant === "soft" ? "none" : uiShadows.soft}
      {...baseButtonStyles}
      {...resolvedVariant}
      {...props}
    >
      {hasIcon ? (
        <HStack as="span" spacing={2}>
          {resolvedStartElement ? (
            <Box as="span" display="inline-flex" alignItems="center">
              {resolvedStartElement}
            </Box>
          ) : null}
          <Box as="span">{children}</Box>
          {resolvedEndElement ? (
            <Box as="span" display="inline-flex" alignItems="center">
              {resolvedEndElement}
            </Box>
          ) : null}
        </HStack>
      ) : (
        children
      )}
    </Button>
  );
}

export function AppIconButton({ variant = "soft", size = "sm", icon, children, ...props }) {
  const content = children ?? icon;
  const controlSize = uiControlSizes[size] || uiControlSizes.sm;
  const resolvedVariant = buttonVariants[variant] || buttonVariants.soft;

  return (
    <IconButton
      h={controlSize.h}
      minW={controlSize.h}
      w={controlSize.h}
      borderWidth="1px"
      borderRadius={uiRadii.pill}
      {...baseButtonStyles}
      {...resolvedVariant}
      {...props}
    >
      {content}
    </IconButton>
  );
}
