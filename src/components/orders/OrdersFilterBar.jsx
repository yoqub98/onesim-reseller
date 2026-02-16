// Renders tab switcher, search input, and filter actions — used in OrdersPage
import {
  ArrowPathIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { AppButton, AppIconButton, UnderlineTabs } from "../ui";
import { uiColors } from "../../design-system/tokens";

function OrdersFilterBar({ t, activeTab, query, onTabChange, onQueryChange, onRefresh }) {
  const searchPlaceholder = t.searchPlaceholder?.[activeTab] || t.searchPlaceholder.client;

  return (
    <VStack align="stretch" spacing="14px">
      <HStack justify="space-between" align="center" gap={3}>
        <Box overflowX="auto" pt="14px" flex="1" minW={0}>
          <UnderlineTabs
            value={activeTab}
            options={[
              {
                value: "client",
                label: (
                  <HStack spacing={1.5}>
                    <UserIcon width={15} />
                    <Text>{t.tabs.client}</Text>
                  </HStack>
                )
              },
              {
                value: "group",
                label: (
                  <HStack spacing={1.5}>
                    <UsersIcon width={15} />
                    <Text>{t.tabs.group}</Text>
                  </HStack>
                )
              },
              {
                value: "self",
                label: (
                  <HStack spacing={1.5}>
                    <BuildingOfficeIcon width={15} />
                    <Text>{t.tabs.self}</Text>
                  </HStack>
                )
              }
            ]}
            onChange={onTabChange}
          />
        </Box>
        <AppIconButton
          aria-label={t.refresh}
          variant="outline"
          h="40px"
          minW="40px"
          flexShrink={0}
          bg="white"
          color={uiColors.textPrimary}
          borderColor={uiColors.border}
          icon={<ArrowPathIcon width={18} />}
          onClick={onRefresh}
        />
      </HStack>

      <HStack align="stretch" gap={3} flexWrap="wrap" pt="14px" pb="12px">
        <Box position="relative" flex="1" minW={{ base: "full", md: "320px" }}>
          <Box
            position="absolute"
            left={3}
            top="50%"
            transform="translateY(-50%)"
            color={uiColors.textMuted}
            zIndex={1}
            pointerEvents="none"
            display="inline-flex"
            alignItems="center"
          >
            <MagnifyingGlassIcon width={16} />
          </Box>
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            bg="white"
            pl={9}
            h="40px"
            borderColor={uiColors.border}
            borderRadius="8px"
            fontSize="sm"
          />
        </Box>
        <AppButton variant="outline" h="40px" px={4} borderColor={uiColors.border} startElement={<FunnelIcon width={14} />}>
          {t.filter}
        </AppButton>
      </HStack>
    </VStack>
  );
}

export default OrdersFilterBar;
