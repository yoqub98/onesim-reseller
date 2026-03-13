import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii, uiShadows, uiTransitions } from "../../design-system/tokens";

function StatCard({ label, value, helper, icon, trend, trendDirection = "up" }) {
  const trendColor = trendDirection === "up" ? uiColors.success : uiColors.error;

  return (
    <Box
      bg="white"
      borderRadius={uiRadii.lg}
      border="1px solid"
      borderColor={uiColors.border}
      p={5}
      transition={uiTransitions.standard}
      _hover={{ boxShadow: uiShadows.md, borderColor: uiColors.borderStrong }}
    >
      <HStack justify="space-between" align="start" spacing={4}>
        <VStack align="start" spacing={1}>
          <Text
            fontSize="13px"
            fontWeight="500"
            color={uiColors.textSecondary}
            textTransform="uppercase"
            letterSpacing="0.02em"
          >
            {label}
          </Text>
          <Text
            fontSize="28px"
            fontWeight="700"
            color={uiColors.textPrimary}
            lineHeight="1.2"
          >
            {value}
          </Text>
          {(helper || trend) && (
            <HStack spacing={2} mt={1}>
              {trend && (
                <Text fontSize="12px" fontWeight="600" color={trendColor}>
                  {trendDirection === "up" ? "+" : ""}{trend}
                </Text>
              )}
              {helper && (
                <Text fontSize="12px" color={uiColors.textMuted}>
                  {helper}
                </Text>
              )}
            </HStack>
          )}
        </VStack>
        {icon && (
          <Box
            p={3}
            borderRadius={uiRadii.md}
            bg={uiColors.surfaceSoft}
            color={uiColors.accent}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </Box>
        )}
      </HStack>
    </Box>
  );
}

export default StatCard;
