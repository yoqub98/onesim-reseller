import { Box, HStack, Text } from "@chakra-ui/react";
import { CircleFlag } from "react-circle-flags";
import { useLocale } from "../../context/LocaleContext";
import { SegmentedControl } from "../ui";

/**
 * LanguageSwitcher - Reusable language selector component
 * Used in both authenticated and public pages (login/signup)
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <SegmentedControl
      value={locale}
      options={[
        {
          value: "uz",
          label: (
            <HStack spacing={1.5}>
              <Box
                w="14px"
                h="14px"
                borderRadius="full"
                overflow="hidden"
                flexShrink={0}
              >
                <CircleFlag countryCode="uz" height={14} />
              </Box>
              <Text textTransform="uppercase">uz</Text>
            </HStack>
          )
        },
        {
          value: "ru",
          label: (
            <HStack spacing={1.5}>
              <Box
                w="14px"
                h="14px"
                borderRadius="full"
                overflow="hidden"
                flexShrink={0}
              >
                <CircleFlag countryCode="ru" height={14} />
              </Box>
              <Text textTransform="uppercase">ru</Text>
            </HStack>
          )
        },
        {
          value: "en",
          label: (
            <HStack spacing={1.5}>
              <Box
                w="14px"
                h="14px"
                borderRadius="full"
                overflow="hidden"
                flexShrink={0}
              >
                <CircleFlag countryCode="gb" height={14} />
              </Box>
              <Text textTransform="uppercase">en</Text>
            </HStack>
          )
        }
      ]}
      onChange={setLocale}
    />
  );
}
