import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Code,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  VStack
} from "@chakra-ui/react";
import {
  ArrowPathIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SwatchIcon
} from "@heroicons/react/24/outline";
import { BanknotesIcon } from "@heroicons/react/24/solid";
import PageHeader from "../components/layout/PageHeader";
import { AppButton, AppDataTable, AppDataTableCell, AppDataTableRow, AppIconButton, AppInput, AppSelect, FilterChips, SegmentedControl, SurfaceCard, UnderlineTabs, PackageDisplay } from "../components/ui";
import AppToastStack from "../components/common/AppToastStack";
import CountryFlag from "../components/common/CountryFlag";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";
import StatCard from "../components/dashboard/StatCard";
import StatusPill from "../components/orders/StatusPill";
import StepIndicator from "../components/order/StepIndicator";
import {
  ORDER_STATUS_ACTIVE,
  ORDER_STATUS_EXPIRED,
  ORDER_STATUS_FAILED,
  ORDER_STATUS_PENDING
} from "../constants/statuses";
import { pageLayout, uiColors, uiRadii, uiShadows } from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";

const chipOptions = [
  { value: "all", label: "Barchasi" },
  { value: "active", label: "Faol" },
  { value: "archived", label: "Arxiv" }
];

const tabOptions = [
  { value: "components", label: "Komponentlar" },
  { value: "states", label: "Holatlar" },
  { value: "examples", label: "Misollar" }
];

const sectionCardProps = {
  p: { base: 4, md: 6 },
  borderRadius: "xl"
};

function TokenSwatch({ name, value }) {
  return (
    <Box borderWidth="1px" borderColor={uiColors.border} borderRadius="lg" overflow="hidden">
      <Box h="72px" bg={value} borderBottomWidth="1px" borderColor={uiColors.border} />
      <Box p={3}>
        <Text fontSize="xs" color={uiColors.textSecondary} mb={1}>{name}</Text>
        <Code fontSize="xs">{String(value)}</Code>
      </Box>
    </Box>
  );
}

function DesignSystemPage() {
  const [activeChip, setActiveChip] = useState(chipOptions[0].value);
  const [activeSegment, setActiveSegment] = useState(chipOptions[0].value);
  const [activeTab, setActiveTab] = useState(tabOptions[0].value);
  const { toasts, pushToast } = useAppToasts();

  const statusLabels = useMemo(
    () => ({
      [ORDER_STATUS_ACTIVE]: "Active",
      [ORDER_STATUS_PENDING]: "Pending",
      [ORDER_STATUS_FAILED]: "Failed",
      [ORDER_STATUS_EXPIRED]: "Expired"
    }),
    []
  );

  return (
    <VStack align="stretch" spacing={pageLayout.sectionGap} w="full">
      <AppToastStack items={toasts} />

      <PageHeader
        title="Design System"
        subtitle="Qayta ishlatiladigan barcha UI elementlarining bitta sahifadagi namoyishi"
      >
        <HStack spacing={2}>
          <AppButton variant="soft" leftIcon={<ArrowPathIcon width={16} />}>Refresh</AppButton>
          <AppButton variant="primary" leftIcon={<PlusIcon width={16} />}>New Item</AppButton>
        </HStack>
      </PageHeader>

      <SurfaceCard {...sectionCardProps}>
        <VStack align="stretch" spacing={4}>
          <HStack spacing={2}>
            <SwatchIcon width={18} />
            <Heading size="sm">Colors & Tokens</Heading>
          </HStack>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
            {Object.entries(uiColors).map(([key, value]) => (
              <TokenSwatch key={key} name={key} value={value} />
            ))}
          </SimpleGrid>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
            <Box borderWidth="1px" borderColor={uiColors.border} borderRadius={uiRadii.lg} p={3}>
              <Text fontSize="sm" fontWeight="700" mb={1}>Radius tokens</Text>
              <Text fontSize="sm">lg: {uiRadii.lg}</Text>
              <Text fontSize="sm">md: {uiRadii.md}</Text>
              <Text fontSize="sm">sm: {uiRadii.sm}</Text>
              <Text fontSize="sm">pill: {uiRadii.pill}</Text>
            </Box>
            <Box borderWidth="1px" borderColor={uiColors.border} borderRadius={uiRadii.md} p={3}>
              <Text fontSize="sm" fontWeight="700" mb={1}>Shadow token</Text>
              <Text fontSize="sm" color={uiColors.textSecondary}>soft</Text>
              <Box mt={2} borderRadius="md" p={4} borderWidth="1px" boxShadow={uiShadows.soft}>
                <Text fontSize="xs">Preview</Text>
              </Box>
            </Box>
            <Box borderWidth="1px" borderColor={uiColors.border} borderRadius={uiRadii.md} p={3}>
              <Text fontSize="sm" fontWeight="700" mb={1}>Typography baseline</Text>
              <Text color={uiColors.textPrimary}>Primary text</Text>
              <Text color={uiColors.textSecondary}>Secondary text</Text>
              <Text color={uiColors.textMuted}>Muted text</Text>
            </Box>
          </Grid>
        </VStack>
      </SurfaceCard>

      <SurfaceCard {...sectionCardProps}>
        <VStack align="stretch" spacing={4}>
          <Heading size="sm">Buttons</Heading>
          <Stack direction={{ base: "column", md: "row" }} spacing={3} flexWrap="wrap">
            <AppButton variant="primary">Primary</AppButton>
            <AppButton variant="dark">Dark</AppButton>
            <AppButton variant="outline">Outline</AppButton>
            <AppButton variant="soft">Soft</AppButton>
            <AppButton variant="ghost">Ghost</AppButton>
            <AppButton variant="primary" leftIcon={<PlusIcon width={16} />}>With Icon</AppButton>
            <AppButton variant="soft" isDisabled>Disabled</AppButton>
          </Stack>
          <HStack spacing={3}>
            <AppIconButton aria-label="bell" variant="soft" icon={<BellIcon width={16} />} />
            <AppIconButton aria-label="refresh" variant="dark" icon={<ArrowPathIcon width={16} />} />
            <AppIconButton aria-label="add" variant="primary" icon={<PlusIcon width={16} />} />
          </HStack>
        </VStack>
      </SurfaceCard>

      <SurfaceCard {...sectionCardProps}>
        <VStack align="stretch" spacing={4}>
          <Heading size="sm">Inputs & Select</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <AppInput
              label="Basic Input"
              placeholder="Enter value"
              helperText="Helper text example"
            />
            <AppInput
              label="Search"
              placeholder="Search packages..."
              leftElement={<MagnifyingGlassIcon width={16} />}
            />
            <AppInput
              label="Error Input"
              placeholder="Incorrect value"
              error="This field is required"
            />
            <Box>
              <Text fontSize="14px" fontWeight="500" mb="8px">Select</Text>
              <AppSelect defaultValue="usd">
                <option value="usd">USD</option>
                <option value="uzs">UZS</option>
                <option value="eur">EUR</option>
              </AppSelect>
            </Box>
          </SimpleGrid>
        </VStack>
      </SurfaceCard>

      <SurfaceCard {...sectionCardProps}>
        <VStack align="stretch" spacing={5}>
          <Heading size="sm">Tabs, Chips & Controls</Heading>
          <Box>
            <Text fontSize="sm" fontWeight="600" mb={2}>Filter Chips</Text>
            <FilterChips value={activeChip} options={chipOptions} onChange={setActiveChip} />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" mb={2}>Segmented Control</Text>
            <SegmentedControl value={activeSegment} options={chipOptions} onChange={setActiveSegment} />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" mb={2}>Underline Tabs</Text>
            <UnderlineTabs value={activeTab} options={tabOptions} onChange={setActiveTab} />
          </Box>
          <HStack spacing={2}>
            <Badge colorPalette="green">Default Badge</Badge>
            <Badge colorPalette="orange">In Progress</Badge>
            <Badge colorPalette="red">Critical</Badge>
          </HStack>
        </VStack>
      </SurfaceCard>

      <SurfaceCard {...sectionCardProps}>
        <VStack align="stretch" spacing={4}>
          <Heading size="sm">Status & Steps</Heading>
          <HStack spacing={3} flexWrap="wrap">
            <StatusPill value={ORDER_STATUS_ACTIVE} labels={statusLabels} />
            <StatusPill value={ORDER_STATUS_PENDING} labels={statusLabels} />
            <StatusPill value={ORDER_STATUS_FAILED} labels={statusLabels} />
            <StatusPill value={ORDER_STATUS_EXPIRED} labels={statusLabels} />
          </HStack>
          <StepIndicator
            currentStep={2}
            steps={[
              { id: "step-1", label: "Mijoz ma'lumotlari" },
              { id: "step-2", label: "Paket tanlash" },
              { id: "step-3", label: "To'lov va tasdiqlash" }
            ]}
          />
        </VStack>
      </SurfaceCard>

      <SurfaceCard {...sectionCardProps}>
        <VStack align="stretch" spacing={4}>
          <Heading size="sm">Cards, Flags & Package Display</Heading>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <StatCard
              label="Total Earnings"
              value="$12,450"
              helper="+14.3% this month"
              icon={<BanknotesIcon width={22} color={uiColors.accent} />}
            />
            <Box borderWidth="1px" borderColor={uiColors.border} borderRadius="xl" p={5} bg="white">
              <Text fontSize="sm" color={uiColors.textSecondary} mb={3}>PackageDisplay</Text>
              <PackageDisplay countryCode="us" destination="United States" dataLabel="20 GB - 30 days" />
              <HStack spacing={3} mt={4}>
                <CountryFlag code="gb" size={20} />
                <CountryFlag code="jp" size={20} />
                <CountryFlag code="fr" size={20} />
                <CountryFlag code="xx" size={20} />
              </HStack>
            </Box>
          </Grid>
        </VStack>
      </SurfaceCard>

      <SurfaceCard {...sectionCardProps}>
        <VStack align="stretch" spacing={4}>
          <Heading size="sm">Data Table</Heading>
          <AppDataTable
            minWidth="820px"
            columns="1.2fr 1fr 0.8fr 0.8fr"
            headers={["Package", "Customer", "Status", "Amount"]}
          >
            <AppDataTableRow columns="1.2fr 1fr 0.8fr 0.8fr">
              <AppDataTableCell>
                <Text fontWeight="600">Europe 10GB</Text>
              </AppDataTableCell>
              <AppDataTableCell>john@example.com</AppDataTableCell>
              <AppDataTableCell>
                <StatusPill value={ORDER_STATUS_ACTIVE} labels={statusLabels} />
              </AppDataTableCell>
              <AppDataTableCell align="right">$25.00</AppDataTableCell>
            </AppDataTableRow>
            <AppDataTableRow columns="1.2fr 1fr 0.8fr 0.8fr">
              <AppDataTableCell>
                <Text fontWeight="600">USA Unlimited</Text>
              </AppDataTableCell>
              <AppDataTableCell>sarah@example.com</AppDataTableCell>
              <AppDataTableCell>
                <StatusPill value={ORDER_STATUS_PENDING} labels={statusLabels} />
              </AppDataTableCell>
              <AppDataTableCell align="right">$39.00</AppDataTableCell>
            </AppDataTableRow>
          </AppDataTable>
        </VStack>
      </SurfaceCard>

      <SurfaceCard {...sectionCardProps}>
        <VStack align="stretch" spacing={4}>
          <Heading size="sm">Feedback & Utility Components</Heading>
          <HStack spacing={2} flexWrap="wrap">
            <AppButton
              variant="soft"
              onClick={() =>
                pushToast({
                  type: "success",
                  title: "Success toast",
                  description: "Changes were saved."
                })
              }
            >
              Show Success Toast
            </AppButton>
            <AppButton
              variant="soft"
              onClick={() =>
                pushToast({
                  type: "error",
                  title: "Error toast",
                  description: "Something went wrong."
                })
              }
            >
              Show Error Toast
            </AppButton>
          </HStack>
          <Box>
            <Text fontSize="sm" fontWeight="600" mb={2}>Language Switcher</Text>
            <LanguageSwitcher />
          </Box>
        </VStack>
      </SurfaceCard>
    </VStack>
  );
}

export default DesignSystemPage;
