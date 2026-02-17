import { Box } from "@chakra-ui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { CircleFlag } from "react-circle-flags";
import { useLocale } from "../../context/LocaleContext";
import { uiColors, uiRadii } from "../../design-system/tokens";

/**
 * LanguageSwitcher - Reusable language selector component
 * Used in both authenticated and public pages (login/signup)
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const options = [
    { value: "uz", flag: "uz" },
    { value: "ru", flag: "ru" }
  ];
  const selected = options.find((option) => option.value === locale) || options[0];

  return (
    <Box position="relative" minW="82px">
      <Box
        position="absolute"
        left={3}
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        zIndex={1}
      >
        <Box
          w="14px"
          h="14px"
          borderRadius="full"
          overflow="hidden"
          flexShrink={0}
        >
          <CircleFlag countryCode={selected.flag} height={14} />
        </Box>
      </Box>

      <Box
        as="select"
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        appearance="none"
        h="36px"
        w="100%"
        ps="34px"
        pe="28px"
        borderWidth="1px"
        borderColor={uiColors.border}
        borderRadius={uiRadii.pill}
        bg="white"
        color={uiColors.textPrimary}
        fontSize="sm"
        fontWeight="600"
        textTransform="uppercase"
        cursor="pointer"
        _hover={{ borderColor: uiColors.borderStrong }}
        _focusVisible={{ outline: "none", borderColor: uiColors.accent }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </Box>

      <Box
        position="absolute"
        right={2.5}
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        color={uiColors.textSecondary}
      >
        <ChevronDownIcon width={14} />
      </Box>
    </Box>
  );
}
