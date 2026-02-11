import {
  Box,
  Flex,
  IconButton,
  useBreakpointValue
} from "@chakra-ui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { uiColors } from "../../design-system/tokens";
import SidebarNav from "./SidebarNav";

function AppShell({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  return (
    <Flex minH="100vh" bg={uiColors.pageBg}>
      <Box
        display={{ base: "none", lg: "block" }}
        w="256px"
        bg={uiColors.sidebarBg}
        color="white"
        borderRightWidth="1px"
        borderColor={uiColors.sidebarBorder}
      >
        <SidebarNav onNavigate={onClose} />
      </Box>

      {!isDesktop && isOpen ? (
        <Box position="fixed" inset={0} zIndex={40} bg="blackAlpha.600" onClick={onClose}>
          <Box
            bg={uiColors.sidebarBg}
            color="white"
            maxW="256px"
            h="100vh"
            borderRightWidth="1px"
            borderColor={uiColors.sidebarBorder}
            onClick={(event) => event.stopPropagation()}
          >
            <SidebarNav onNavigate={onClose} />
          </Box>
        </Box>
      ) : null}

      <Box as="main" flex="1" minW={0} p={{ base: 4, md: 6, xl: 8 }} position="relative">
        {!isDesktop ? (
          <IconButton
            aria-label="Menyu"
            icon={<Bars3Icon width={20} />}
            onClick={onOpen}
            variant="outline"
            bg="white"
            position="sticky"
            top={2}
            zIndex={20}
            mb={3}
          />
        ) : null}
        {children}
      </Box>
    </Flex>
  );
}

export default AppShell;
