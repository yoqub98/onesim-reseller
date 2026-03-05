import { Box, Text, Textarea } from "@chakra-ui/react";
import { uiColors, uiRadii, uiShadows } from "../../design-system/tokens";

const statusStyles = {
  default: {
    borderColor: uiColors.border,
    hoverBorderColor: uiColors.borderStrong,
    focusBorderColor: uiColors.accent,
    focusShadow: uiShadows.focus
  },
  success: {
    borderColor: "#86efac",
    hoverBorderColor: "#4ade80",
    focusBorderColor: uiColors.success,
    focusShadow: "0 0 0 3px rgba(22, 163, 74, 0.25)"
  },
  warning: {
    borderColor: "#fcd34d",
    hoverBorderColor: "#f59e0b",
    focusBorderColor: uiColors.warning,
    focusShadow: "0 0 0 3px rgba(217, 119, 6, 0.24)"
  },
  error: {
    borderColor: "#fca5a5",
    hoverBorderColor: uiColors.error,
    focusBorderColor: uiColors.error,
    focusShadow: "0 0 0 3px rgba(220, 38, 38, 0.22)"
  }
};

function AppTextarea({ label, helperText, error, status = "default", isRequired, containerProps, ...props }) {
  const resolvedStatus = error ? "error" : status;
  const activeStatus = statusStyles[resolvedStatus] || statusStyles.default;

  return (
    <Box {...containerProps}>
      {label ? (
        <Text fontSize="13px" fontWeight="600" color={uiColors.textPrimary} mb="8px">
          {label}
          {isRequired ? (
            <Text as="span" color={uiColors.error} ml={1}>
              *
            </Text>
          ) : null}
        </Text>
      ) : null}

      <Textarea
        minH="104px"
        borderRadius={uiRadii.md}
        borderWidth="1px"
        borderColor={activeStatus.borderColor}
        bg="white"
        color={uiColors.textPrimary}
        fontSize="14px"
        px="12px"
        py="10px"
        resize="vertical"
        _placeholder={{ color: uiColors.textMuted }}
        _hover={{ borderColor: activeStatus.hoverBorderColor }}
        _focusVisible={{
          borderColor: activeStatus.focusBorderColor,
          boxShadow: activeStatus.focusShadow,
          outline: "none"
        }}
        {...props}
      />

      {error ? (
        <Text fontSize="12px" color={uiColors.error} mt="6px">
          {error}
        </Text>
      ) : null}
      {helperText && !error ? (
        <Text fontSize="12px" color={resolvedStatus === "success" ? uiColors.success : uiColors.textMuted} mt="6px">
          {helperText}
        </Text>
      ) : null}
    </Box>
  );
}

export default AppTextarea;
