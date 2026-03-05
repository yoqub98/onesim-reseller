import { Box, Input, Text } from "@chakra-ui/react";
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
            borderWidth="1px"
            borderColor={activeStatus.borderColor}
            bg="white"
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
          <Text fontSize="12px" color={uiColors.error} mt="6px">
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text
            fontSize="12px"
            color={resolvedStatus === "success" ? uiColors.success : uiColors.textMuted}
            mt="6px"
          >
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);

AppInput.displayName = "AppInput";
