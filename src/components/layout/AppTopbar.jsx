import { BellIcon, Bars3Icon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CURRENCY_USD, CURRENCY_UZS } from "../../constants/currency";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import { uiColors } from "../../design-system/tokens";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { AppIconButton, SegmentedControl } from "../ui";

function AppTopbar({ isDesktop, onOpenMenu }) {
  const { currency, setCurrency } = useCurrency();
  const { logout, user, partner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={{ base: 0, lg: "256px" }}
      right={0}
      h="64px"
      bg="white"
      borderBottomWidth="1px"
      borderColor={uiColors.border}
      boxShadow="0px 7px 27.4px rgba(32, 44, 61, 0.1)"
      zIndex={30}
      px={{ base: 3, md: 6, xl: 8 }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <HStack spacing={3}>
        {!isDesktop ? (
          <IconButton
            aria-label="Menyu"
            icon={<Bars3Icon width={20} />}
            onClick={onOpenMenu}
            variant="outline"
            h="36px"
            minW="36px"
            bg="white"
            borderColor={uiColors.border}
          />
        ) : null}
      </HStack>

      <HStack spacing={{ base: 2, md: 3 }}>
        <SegmentedControl
          value={currency}
          options={[
            { value: CURRENCY_UZS, label: CURRENCY_UZS },
            { value: CURRENCY_USD, label: CURRENCY_USD }
          ]}
          onChange={setCurrency}
        />

        <LanguageSwitcher />

        <AppIconButton
          aria-label="Bildirishnomalar"
          variant="ghost"
          icon={<BellIcon width={15} />}
          h="36px"
          minW="36px"
        />

        <HStack spacing={2} pl={{ base: 1, md: 3 }} borderLeftWidth={{ base: 0, md: "1px" }} borderColor={uiColors.border}>
          <Box textAlign="right" display={{ base: "none", md: "block" }}>
            <Text fontSize="xs" fontWeight="700" color={uiColors.textPrimary}>
              {partner?.company_name || "Company"}
            </Text>
            <Text fontSize="11px" color={uiColors.textSecondary}>
              {user?.email || ""}
            </Text>
          </Box>
          <Box
            w="36px"
            h="36px"
            borderRadius="full"
            borderWidth="1px"
            borderColor="rgba(254,79,24,0.2)"
            bg="rgba(254,79,24,0.1)"
            color={uiColors.accent}
            display="grid"
            placeItems="center"
            fontWeight="700"
            fontSize="xs"
          >
            {partner?.company_name?.charAt(0) || "?"}
          </Box>
        </HStack>

        {/* Logout Button */}
        <AppIconButton
          aria-label="Chiqish"
          variant="ghost"
          icon={<ArrowRightOnRectangleIcon width={15} />}
          onClick={handleLogout}
          h="36px"
          minW="36px"
          color={uiColors.textSecondary}
          _hover={{ color: uiColors.accent, bg: uiColors.accentSoft }}
        />
      </HStack>
    </Box>
  );
}

export default AppTopbar;
