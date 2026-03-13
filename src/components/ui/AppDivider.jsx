import { Box, HStack, Text } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";

export function AppDivider({
  orientation = "horizontal",
  variant = "solid",
  color = uiColors.border,
  thickness = "1px",
  spacing = 0,
  label,
  labelPosition = "center"
}) {
  const isHorizontal = orientation === "horizontal";
  const borderStyle = variant === "dashed" ? "dashed" : "solid";

  if (label) {
    return (
      <HStack spacing={4} w="full" my={spacing}>
        {labelPosition !== "left" && (
          <Box
            flex={labelPosition === "center" ? 1 : "none"}
            w={labelPosition === "right" ? "40px" : "auto"}
            h={thickness}
            bg={color}
            style={{ borderStyle }}
          />
        )}
        <Text
          fontSize="12px"
          fontWeight="500"
          color={uiColors.textMuted}
          textTransform="uppercase"
          letterSpacing="0.05em"
          whiteSpace="nowrap"
          px={2}
        >
          {label}
        </Text>
        {labelPosition !== "right" && (
          <Box
            flex={labelPosition === "center" ? 1 : "none"}
            w={labelPosition === "left" ? "40px" : "auto"}
            h={thickness}
            bg={color}
            style={{ borderStyle }}
          />
        )}
      </HStack>
    );
  }

  return (
    <Box
      w={isHorizontal ? "full" : thickness}
      h={isHorizontal ? thickness : "full"}
      bg={color}
      my={isHorizontal ? spacing : 0}
      mx={isHorizontal ? 0 : spacing}
      flexShrink={0}
      style={{ borderStyle }}
    />
  );
}

export function AppVerticalDivider({ h = "24px", color = uiColors.border, mx = 3 }) {
  return (
    <Box
      w="1px"
      h={h}
      bg={color}
      mx={mx}
      flexShrink={0}
    />
  );
}

export default AppDivider;
