import { Box, HStack, Text } from "@chakra-ui/react";
import CountryFlag from "../common/CountryFlag";
import { uiColors } from "../../design-system/tokens";

function PackageDisplay({
  countryCode,
  destination,
  dataLabel,
  flagSize = 40,
  titleSize = "sm",
  subtitleSize = "xs",
  spacing = 3
}) {
  return (
    <HStack spacing={spacing}>
      <CountryFlag code={countryCode} size={flagSize} />
      <Box>
        <Text color={uiColors.textPrimary} fontSize={titleSize} fontWeight="700">
          {destination || "-"}
        </Text>
        <Text color={uiColors.textSecondary} fontSize={subtitleSize}>
          {dataLabel || "-"}
        </Text>
      </Box>
    </HStack>
  );
}

export default PackageDisplay;
