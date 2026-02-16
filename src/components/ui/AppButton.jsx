import { Box, Button, HStack, IconButton } from "@chakra-ui/react";
import { uiColors, uiRadii, uiShadows } from "../../design-system/tokens";

const baseButtonStyles = {
  borderRadius: uiRadii.sm,
  fontWeight: "500",
  color: uiColors.textPrimary,
  borderColor: uiColors.borderStrong,
  _hover: { bg: uiColors.surfaceSoft, borderColor: uiColors.borderStrong },
  _active: { transform: "translateY(0.5px)" }
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
    _hover: { bg: "white", borderColor: uiColors.accentHover }
  },
  soft: {
    bg: uiColors.surfaceSoft,
    color: "#314158",
    borderColor: "transparent",
    _hover: { bg: "#e8edf4" }
  },
  ghost: {
    bg: "transparent",
    borderColor: "transparent",
    color: uiColors.textSecondary,
    _hover: { bg: uiColors.surfaceSoft, color: uiColors.textPrimary }
  }
};

export function AppButton({
  variant = "soft",
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

  return (
    <Button
      size="sm"
      borderWidth="1px"
      boxShadow={variant === "soft" ? "none" : uiShadows.soft}
      {...baseButtonStyles}
      {...buttonVariants[variant]}
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

export function AppIconButton({ variant = "soft", icon, children, ...props }) {
  const content = children ?? icon;

  return (
    <IconButton
      size="sm"
      borderWidth="1px"
      borderRadius={uiRadii.pill}
      {...baseButtonStyles}
      {...buttonVariants[variant]}
      {...props}
    >
      {content}
    </IconButton>
  );
}
