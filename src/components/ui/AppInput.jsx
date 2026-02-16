import { Box, Input, Text } from "@chakra-ui/react";
import { forwardRef } from "react";
import { uiColors, uiRadii } from "../../design-system/tokens";

/**
 * AppInput - Reusable input component matching the design system
 * Used for all form inputs across the application
 */
export const AppInput = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      containerProps,
      ...inputProps
    },
    ref
  ) => {
    return (
      <Box {...containerProps}>
        {label && (
          <Text
            fontSize="14px"
            fontWeight="500"
            color={uiColors.textPrimary}
            mb="8px"
          >
            {label}
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
            h="44px"
            borderRadius={uiRadii.sm}
            borderWidth="1px"
            borderColor={error ? "#ef4444" : uiColors.border}
            bg="white"
            color={uiColors.textPrimary}
            fontSize="14px"
            pl={leftElement ? "40px" : "12px"}
            pr={rightElement ? "40px" : "12px"}
            _placeholder={{
              color: uiColors.textMuted
            }}
            _hover={{
              borderColor: error ? "#ef4444" : uiColors.borderStrong
            }}
            _focus={{
              borderColor: error ? "#ef4444" : uiColors.accent,
              boxShadow: error
                ? "0 0 0 1px #ef4444"
                : `0 0 0 1px ${uiColors.accent}`,
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
              zIndex={1}
            >
              {rightElement}
            </Box>
          )}
        </Box>
        {error && (
          <Text fontSize="13px" color="#ef4444" mt="6px">
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text fontSize="13px" color={uiColors.textMuted} mt="6px">
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);

AppInput.displayName = "AppInput";
