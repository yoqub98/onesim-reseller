import { CheckIcon } from "@heroicons/react/24/solid";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";

function StepIndicator({ steps, currentStep }) {
  return (
    <HStack spacing={3} align="stretch" flexWrap="wrap">
      {steps.map((step, idx) => {
        const stepIndex = idx + 1;
        const isActive = stepIndex === currentStep;
        const isDone = stepIndex < currentStep;

        return (
          <Box
            key={step.id}
            flex="1"
            minW={{ base: "100%", md: "220px" }}
            borderWidth="1px"
            borderColor={isActive ? "orange.300" : "gray.200"}
            bg={isActive ? "orange.50" : "white"}
            borderRadius="lg"
            p={3}
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500">Qadam {stepIndex}</Text>
                <Text fontWeight="semibold">{step.label}</Text>
              </VStack>
              <Box
                w="22px"
                h="22px"
                borderRadius="full"
                display="grid"
                placeItems="center"
                bg={isDone ? "green.500" : isActive ? "#FE4F18" : "gray.200"}
                color="white"
              >
                {isDone ? <CheckIcon width={12} /> : <Text fontSize="xs">{stepIndex}</Text>}
              </Box>
            </HStack>
          </Box>
        );
      })}
    </HStack>
  );
}

export default StepIndicator;
