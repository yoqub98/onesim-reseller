import { CheckIcon } from "@heroicons/react/24/solid";
import { Box, HStack, Text } from "@chakra-ui/react";
import { uiColors, uiRadii, uiTransitions } from "../../design-system/tokens";

function StepIndicator({ steps, currentStep, variant = "horizontal" }) {
  const isVertical = variant === "vertical";

  return (
    <HStack
      spacing={0}
      align="stretch"
      flexDirection={isVertical ? "column" : "row"}
      w="full"
    >
      {steps.map((step, idx) => {
        const stepIndex = idx + 1;
        const isActive = stepIndex === currentStep;
        const isDone = stepIndex < currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <HStack
            key={step.id}
            flex={isVertical ? "none" : 1}
            spacing={0}
            align="center"
          >
            <HStack spacing={3} align="center">
              <Box
                w="32px"
                h="32px"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={isDone ? uiColors.success : isActive ? uiColors.accent : "white"}
                border="2px solid"
                borderColor={isDone ? uiColors.success : isActive ? uiColors.accent : uiColors.border}
                color={isDone || isActive ? "white" : uiColors.textMuted}
                fontWeight="600"
                fontSize="13px"
                transition={uiTransitions.standard}
                flexShrink={0}
              >
                {isDone ? <CheckIcon width={16} /> : stepIndex}
              </Box>

              <Box>
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color={isActive ? uiColors.textPrimary : isDone ? uiColors.textSecondary : uiColors.textMuted}
                  whiteSpace="nowrap"
                >
                  {step.label}
                </Text>
                {step.description && (
                  <Text fontSize="12px" color={uiColors.textMuted} mt={0.5}>
                    {step.description}
                  </Text>
                )}
              </Box>
            </HStack>

            {!isLast && (
              <Box
                flex={1}
                h="2px"
                mx={4}
                bg={isDone ? uiColors.success : uiColors.border}
                borderRadius={uiRadii.pill}
                minW="24px"
                transition={uiTransitions.standard}
              />
            )}
          </HStack>
        );
      })}
    </HStack>
  );
}

export default StepIndicator;
