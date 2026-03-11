import { Box, HStack, Input, Text } from "@chakra-ui/react";
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { forwardRef } from "react";
import { uiColors, uiControlSizes, uiRadii, uiShadows } from "../../design-system/tokens";

/**
 * AppInput - Reusable input component matching the design system
 * Used for all form inputs across the application
 */
export const AppInput = forwardRef(
  (
    {
      label,
      error,
      status = "default",
      size = "md",
      helperText,
      leftElement,
      rightElement,
      isRequired,
      rightElementPointerEvents = "auto",
      containerProps,
      ...inputProps
    },
    ref
  ) => {
    const resolvedStatus = error ? "error" : status;
    const controlSize = uiControlSizes[size] || uiControlSizes.md;
    const statusStyles = {
      default: {
        borderColor: uiColors.border,
        hoverBorderColor: uiColors.borderStrong,
        focusBorderColor: uiColors.accent,
        focusShadow: uiShadows.focus,
        bg: "white"
      },
      success: {
        borderColor: uiColors.success,
        hoverBorderColor: "#15803d",
        focusBorderColor: uiColors.success,
        focusShadow: "0 0 0 3px rgba(22, 163, 74, 0.15)",
        bg: "white"
      },
      warning: {
        borderColor: uiColors.warning,
        hoverBorderColor: "#b45309",
        focusBorderColor: uiColors.warning,
        focusShadow: "0 0 0 3px rgba(217, 119, 6, 0.15)",
        bg: "white"
      },
      error: {
        borderColor: uiColors.error,
        hoverBorderColor: "#b91c1c",
        focusBorderColor: uiColors.error,
        focusShadow: "0 0 0 3px rgba(220, 38, 38, 0.15)",
        bg: "white"
      }
    };
    const activeStatus = statusStyles[resolvedStatus] || statusStyles.default;

    return (
      <Box {...containerProps}>
        {label && (
          <Text
            fontSize="13px"
            fontWeight="600"
            color={uiColors.textPrimary}
            mb="8px"
          >
            {label}
            {isRequired ? (
              <Text as="span" color={uiColors.error} ml={1}>
                *
              </Text>
            ) : null}
          </Text>
        )}
        <Box position="relative">
          {leftElement && (
            <Box
              position="absolute"
              left="12px"
              top="50%"
              transform="translateY(-50%)"
              display="flex"
              alignItems="center"
              color={uiColors.textMuted}
              pointerEvents="none"
              zIndex={1}
            >
              {leftElement}
            </Box>
          )}
          <Input
            ref={ref}
            h={controlSize.h}
            borderRadius={uiRadii.md}
            borderWidth="1.5px"
            borderColor={activeStatus.borderColor}
            bg={activeStatus.bg}
            color={uiColors.textPrimary}
            fontSize={controlSize.fontSize}
            pl={leftElement ? "40px" : "12px"}
            pr={rightElement ? "40px" : "12px"}
            _placeholder={{
              color: uiColors.textMuted
            }}
            _hover={{
              borderColor: activeStatus.hoverBorderColor
            }}
            _focusVisible={{
              borderColor: activeStatus.focusBorderColor,
              boxShadow: activeStatus.focusShadow,
              outline: "none"
            }}
            _disabled={{
              bg: "#f3f4f6",
              borderColor: "#e5e7eb",
              color: "#9ca3af",
              cursor: "not-allowed",
              opacity: 0.7
            }}
            {...inputProps}
          />
          {rightElement && (
            <Box
              position="absolute"
              right="12px"
              top="50%"
              transform="translateY(-50%)"
              display="flex"
              alignItems="center"
              color={uiColors.textMuted}
              cursor="pointer"
              pointerEvents={rightElementPointerEvents}
              zIndex={1}
            >
              {rightElement}
            </Box>
          )}
        </Box>
        {error && (
          <HStack spacing={1.5} mt="6px" align="center">
            <ExclamationCircleIcon width={14} color={uiColors.error} style={{ flexShrink: 0 }} />
            <Text fontSize="12px" color={uiColors.error}>
              {error}
            </Text>
          </HStack>
        )}
        {helperText && !error && (
          <HStack spacing={1.5} mt="6px" align="center">
            {resolvedStatus === "success" && (
              <CheckCircleIcon width={14} color={uiColors.success} style={{ flexShrink: 0 }} />
            )}
            {resolvedStatus === "warning" && (
              <ExclamationTriangleIcon width={14} color={uiColors.warning} style={{ flexShrink: 0 }} />
            )}
            <Text
              fontSize="12px"
              color={
                resolvedStatus === "success"
                  ? uiColors.success
                  : resolvedStatus === "warning"
                    ? uiColors.warning
                    : uiColors.textMuted
              }
            >
              {helperText}
            </Text>
          </HStack>
        )}
      </Box>
    );
  }
);

AppInput.displayName = "AppInput";
