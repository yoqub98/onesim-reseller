import { Box } from "@chakra-ui/react";
import { CircleFlag } from "react-circle-flags";

function CountryFlag({ code, size = 18 }) {
  const normalizedCode = String(code || "").trim().toLowerCase();
  const isValidCode = /^[a-z]{2}$/.test(normalizedCode);

  if (!isValidCode) {
    return <Box w={`${size}px`} h={`${size}px`} borderRadius="full" bg="gray.200" />;
  }

  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.200"
      flexShrink={0}
    >
      <CircleFlag countryCode={normalizedCode} height={size} />
    </Box>
  );
}

export default CountryFlag;
