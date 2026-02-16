// Renders the order progress timeline with completed steps — used in OrderDetailsPage
import { CheckIcon } from "@heroicons/react/24/outline";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { SurfaceCard } from "../ui";
import { uiColors } from "../../design-system/tokens";

function formatStepTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short"
  }).format(date);
}

function StepStatus({ completed }) {
  return (
    <Badge
      bg="#fff7ed"
      borderWidth="1px"
      borderColor="#ffedd4"
      color="#fe4f18"
      borderRadius="full"
      px={2}
      py={0.5}
      textTransform="none"
      fontSize="10px"
      fontWeight="700"
      visibility={completed ? "visible" : "hidden"}
    >
      Yakunlangan
    </Badge>
  );
}

function OrderTimeline({ timeline }) {
  return (
    <SurfaceCard p={6} borderRadius="14px">
      <HStack minW="720px" align="start" justify="space-between" spacing={0}>
        {timeline.map((step, index) => {
          const completed = Boolean(step.date);
          return (
            <Box key={step.id} flex="1" position="relative" pr={index === timeline.length - 1 ? 0 : 3}>
              {index < timeline.length - 1 ? (
                <Box
                  position="absolute"
                  top="12px"
                  left="24px"
                  right="-6px"
                  h="2px"
                  bg={completed ? uiColors.accent : uiColors.border}
                  zIndex={0}
                />
              ) : null}
              <VStack align="start" position="relative" zIndex={1} spacing={1}>
                <Box
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  bg={completed ? uiColors.accent : "white"}
                  borderWidth="1px"
                  borderColor={completed ? uiColors.accent : uiColors.border}
                  display="grid"
                  placeItems="center"
                  color={completed ? "white" : uiColors.textMuted}
                >
                  {completed ? <CheckIcon width={12} /> : <Text fontSize="10px">{index + 1}</Text>}
                </Box>
                <Text fontSize="10px" color={uiColors.textMuted} fontWeight="700" letterSpacing="0.5px">
                  {step.step}
                </Text>
                <Text fontSize="sm" color={uiColors.textPrimary} fontWeight="700">
                  {step.label}
                </Text>
                <StepStatus completed={completed} />
                <Text fontSize="10px" color={uiColors.textMuted} fontFamily="mono">
                  {formatStepTime(step.date)}
                </Text>
              </VStack>
            </Box>
          );
        })}
      </HStack>
    </SurfaceCard>
  );
}

export default OrderTimeline;
