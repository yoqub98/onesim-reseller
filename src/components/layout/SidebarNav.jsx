import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import {
  BanknotesIcon,
  HomeIcon as HomeOutlineIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { BriefcaseIcon } from "@heroicons/react/24/solid";
import { uiColors, uiRadii } from "../../design-system/tokens";

const navItems = [
  { to: "/", label: "Boshqaruv Paneli", icon: HomeOutlineIcon },
  { to: "/catalog", label: "eSIM Tariflar", icon: Squares2X2Icon },
  { to: "/orders", label: "Buyurtmalarim", icon: RectangleStackIcon },
  { to: "/groups", label: "Mijozlar Guruhlari", icon: UserGroupIcon },
  { to: "/earnings", label: "Mening Daromadlarim", icon: BanknotesIcon }
];

function SidebarNav({ onNavigate }) {
  return (
    <Flex direction="column" h="full">
      <Box px={6} py={6} borderBottomWidth="1px" borderColor={uiColors.sidebarBorder}>
        <Text color="white" fontSize="2xl" fontWeight="700">OneSIM</Text>
        <Box
          mt={4}
          px={3}
          py={3}
          borderRadius={uiRadii.md}
          bg={uiColors.sidebarSurface}
        >
          <HStack spacing={3} align="start">
            <Box
              bg="rgba(255, 200, 183, 0.2)"
              w="36px"
              h="36px"
              borderRadius={uiRadii.sm}
              display="grid"
              placeItems="center"
              color="#ffc8b7"
            >
              <BriefcaseIcon width={20} />
            </Box>
            <Box minW={0}>
              <Text color="white" fontWeight="700" fontSize="sm" noOfLines={1}>
                Grand Travel Tour
              </Text>
              <Text color={uiColors.textMuted} fontSize="xs" noOfLines={1}>
                MCHJ "Grand Travel"
              </Text>
            </Box>
          </HStack>
        </Box>
      </Box>

      <VStack align="stretch" spacing={2} px={4} py={6}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} onClick={onNavigate}>
              {({ isActive }) => (
                <HStack
                  px={4}
                  h="44px"
                  borderRadius={uiRadii.md}
                  bg={isActive ? uiColors.accent : "transparent"}
                  color={uiColors.sidebarText}
                  _hover={{ bg: isActive ? uiColors.accent : "rgba(255,255,255,0.08)" }}
                  transition="background 0.15s ease"
                >
                  <Icon width={18} />
                  <Text fontSize="sm" fontWeight={isActive ? "700" : "500"}>{item.label}</Text>
                </HStack>
              )}
            </NavLink>
          );
        })}
      </VStack>

      <Box mt="auto" px={4} py={4} borderTopWidth="1px" borderColor={uiColors.sidebarBorder}>
        <HStack
          px={4}
          h="44px"
          borderRadius={uiRadii.md}
          color={uiColors.textMuted}
          _hover={{ bg: "rgba(255,255,255,0.08)" }}
          cursor="pointer"
        >
          <ArrowLeftOnRectangleIcon width={18} />
          <Text fontSize="sm">Chiqish</Text>
        </HStack>
      </Box>
    </Flex>
  );
}

export default SidebarNav;
