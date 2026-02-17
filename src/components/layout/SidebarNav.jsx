import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import {
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { BriefcaseIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { SIDEBAR_NAV_ITEMS } from "../../constants/navigation";
import { uiColors, uiRadii } from "../../design-system/tokens";

function SidebarNav({ onNavigate, disabled = false }) {
  const { user } = useAuth();

  return (
    <Flex direction="column" h="full" opacity={disabled ? 0.65 : 1}>
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
                {user?.company_name || "Grand Travel Tour"}
              </Text>
              <Text color={uiColors.textMuted} fontSize="xs" noOfLines={1}>
                {user?.legal_name || "MCHJ \"Grand Travel\""}
              </Text>
            </Box>
          </HStack>
        </Box>
      </Box>

      <VStack align="stretch" spacing={2} px={4} py={6}>
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (disabled) {
            return (
              <HStack
                key={item.to}
                px={4}
                h="44px"
                borderRadius={uiRadii.md}
                color={uiColors.sidebarText}
                bg="transparent"
                cursor="not-allowed"
                opacity={0.75}
                aria-disabled="true"
              >
                <Icon width={18} />
                <Text fontSize="sm" fontWeight="500">{item.label}</Text>
              </HStack>
            );
          }

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
          cursor={disabled ? "not-allowed" : "pointer"}
          opacity={disabled ? 0.75 : 1}
        >
          <ArrowLeftOnRectangleIcon width={18} />
          <Text fontSize="sm">Chiqish</Text>
        </HStack>
      </Box>
    </Flex>
  );
}

export default SidebarNav;
