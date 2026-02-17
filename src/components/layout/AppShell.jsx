import {
  Box,
  Flex,
  useBreakpointValue
} from "@chakra-ui/react";
import { useState } from "react";
import { uiColors } from "../../design-system/tokens";
import AppTopbar from "./AppTopbar";
import SidebarNav from "./SidebarNav";

function AppShell({ children, disableNavigation = false }) {
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
        <SidebarNav onNavigate={onClose} disabled={disableNavigation} />
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
            <SidebarNav onNavigate={onClose} disabled={disableNavigation} />
          </Box>
        </Box>
      ) : null}

      <Box as="main" flex="1" minW={0} position="relative">
        <AppTopbar isDesktop={Boolean(isDesktop)} onOpenMenu={onOpen} />
        <Box
          pt={{ base: "76px", md: "84px", xl: "88px" }}
          px={{ base: 3, md: 5, xl: 6 }}
          pb={{ base: 3, md: 5, xl: 6 }}
        >
          <Box
            w="full"
            maxW="1700px"
            mx="auto"
            minH="calc(100vh - 88px - 24px)"
            bg="white"
            border="none"
            borderWidth="0"
            boxShadow="none"
            outline="none"
            borderRadius={{ base: "14px", md: "18px", xl: "21px" }}
            p={{ base: 4, md: 6, xl: 8 }}
            overflow="clip"
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default AppShell;
