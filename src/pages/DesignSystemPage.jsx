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
  EnvelopeIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SwatchIcon
} from "@heroicons/react/24/outline";
import { BanknotesIcon } from "@heroicons/react/24/solid";
import PageHeader from "../components/layout/PageHeader";
import {
  AppAlert,
  AppBreadcrumbs,
  AppButton,
  AppCheckbox,
  AppDataTable,
  AppDataTableCell,
  AppDataTableRow,
  AppIconButton,
  AppInput,
  AppRadioGroup,
  AppSelect,
  AppSwitch,
  AppTextarea,
  FilterChips,
  PackageDisplay,
  Pagination,
  SegmentedControl,
  SurfaceCard,
  UnderlineTabs
} from "../components/ui";
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
import {
  pageLayout,
  uiColors,
  uiControlSizes,
  uiRadii,
  uiShadows,
  uiSpacing,
  uiTypography
} from "../design-system/tokens";
import { useAppToasts } from "../hooks/useAppToasts";

const chipOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" }
];

const tabOptions = [
  { value: "components", label: "Components" },
  { value: "states", label: "States" },
  { value: "examples", label: "Examples" }
];

const radioOptions = [
  {
    value: "monthly",
    label: "Monthly",
    description: "Billed every 30 days"
  },
  {
    value: "yearly",
    label: "Yearly",
    description: "2 months free"
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom quote",
    disabled: true
  }
];

const sectionCardProps = {
  p: { base: 4, md: 6 },
  borderRadius: "2xl"
};

function TokenSwatch({ name, value }) {
  return (
    <Box borderWidth="1px" borderColor={uiColors.border} borderRadius="lg" overflow="hidden">
      <Box h="72px" bg={value} borderBottomWidth="1px" borderColor={uiColors.border} />
      <Box p={3}>
        <Text fontSize="xs" color={uiColors.textSecondary} mb={1}>
          {name}
        </Text>
        <Code fontSize="xs">{String(value)}</Code>
      </Box>
    </Box>
  );
}

function SectionBlock({ title, subtitle, children, rightElement }) {
  return (
    <SurfaceCard {...sectionCardProps}>
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
          <Box>
            <Heading size="sm">{title}</Heading>
            {subtitle ? (
              <Text mt={1} fontSize="sm" color={uiColors.textSecondary}>
                {subtitle}
              </Text>
            ) : null}
          </Box>
          {rightElement}
        </HStack>
        {children}
      </VStack>
    </SurfaceCard>
  );
}

function DesignSystemPage() {
  const [activeChip, setActiveChip] = useState(chipOptions[0].value);
  const [activeSegment, setActiveSegment] = useState(chipOptions[0].value);
  const [activeTab, setActiveTab] = useState(tabOptions[0].value);
  const [currentPage, setCurrentPage] = useState(3);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [isMarketingEnabled, setMarketingEnabled] = useState(true);
  const [checkboxes, setCheckboxes] = useState({ terms: true, updates: false, beta: true });
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

  const colorTokens = Object.entries(uiColors).filter(([, value]) =>
    typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb"))
  );

  return (
    <VStack align="stretch" spacing={pageLayout.sectionGap} w="full">
      <AppToastStack items={toasts} />

      <PageHeader
        title="Design System"
        subtitle="Atomic, tokenized component library for building clean and scalable UI screens"
      >
        <HStack spacing={2}>
          <AppButton size="sm" variant="soft" leftIcon={<ArrowPathIcon width={16} />}>
            Refresh
          </AppButton>
          <AppButton size="sm" variant="primary" leftIcon={<PlusIcon width={16} />}>
            Add Block
          </AppButton>
        </HStack>
      </PageHeader>

      <SectionBlock
        title="Foundations"
        subtitle="Core tokens for color, spacing, radius, elevation and typography"
        rightElement={
          <HStack spacing={2} color={uiColors.textSecondary}>
            <SwatchIcon width={18} />
            <Text fontSize="sm">Token Catalog</Text>
          </HStack>
        }
      >
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={3}>
          {colorTokens.map(([key, value]) => (
            <TokenSwatch key={key} name={key} value={value} />
          ))}
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={4}>
          <Box borderWidth="1px" borderColor={uiColors.border} borderRadius={uiRadii.lg} p={4}>
            <Text fontSize="sm" fontWeight="700" mb={2}>
              Radius Scale
            </Text>
            {Object.entries(uiRadii).map(([k, v]) => (
              <HStack key={k} justify="space-between" py={1}>
                <Text fontSize="xs" color={uiColors.textSecondary}>
                  {k}
                </Text>
                <Code fontSize="xs">{v}</Code>
              </HStack>
            ))}
          </Box>

          <Box borderWidth="1px" borderColor={uiColors.border} borderRadius={uiRadii.lg} p={4}>
            <Text fontSize="sm" fontWeight="700" mb={2}>
              Spacing Scale
            </Text>
            {Object.entries(uiSpacing).map(([k, v]) => (
              <HStack key={k} justify="space-between" py={1}>
                <Text fontSize="xs" color={uiColors.textSecondary}>
                  {k}
                </Text>
                <Code fontSize="xs">{v}</Code>
              </HStack>
            ))}
          </Box>

          <Box borderWidth="1px" borderColor={uiColors.border} borderRadius={uiRadii.lg} p={4}>
            <Text fontSize="sm" fontWeight="700" mb={2}>
              Control Sizes
            </Text>
            {Object.entries(uiControlSizes).map(([k, v]) => (
              <HStack key={k} justify="space-between" py={1}>
                <Text fontSize="xs" color={uiColors.textSecondary}>
                  {k}
                </Text>
                <Code fontSize="xs">h:{v.h}</Code>
              </HStack>
            ))}
            <Box mt={3} p={3} borderWidth="1px" borderRadius={uiRadii.md} boxShadow={uiShadows.soft}>
              <Text fontSize="xs" color={uiColors.textSecondary}>
                Shadow Preview
              </Text>
            </Box>
          </Box>
        </Grid>

        <Box borderWidth="1px" borderColor={uiColors.border} borderRadius={uiRadii.lg} p={4}>
          <Text mb={3} fontSize="sm" fontWeight="700">
            Typography Hierarchy
          </Text>
          <Stack spacing={2}>
            <Text {...uiTypography.display}>Display Heading</Text>
            <Text {...uiTypography.h1}>Heading 1</Text>
            <Text {...uiTypography.h2}>Heading 2</Text>
            <Text {...uiTypography.h3}>Heading 3</Text>
            <Text {...uiTypography.title}>Title / Strong Label</Text>
            <Text {...uiTypography.body} color={uiColors.textSecondary}>
              Body copy for descriptions and content text.
            </Text>
            <Text {...uiTypography.caption} color={uiColors.textMuted}>
              Caption / metadata / helper text
            </Text>
          </Stack>
        </Box>
      </SectionBlock>

      <SectionBlock title="Buttons" subtitle="Primary actions, utility actions, icon-only actions and states">
        <Stack direction={{ base: "column", md: "row" }} spacing={3} flexWrap="wrap">
          <AppButton variant="primary">Primary</AppButton>
          <AppButton variant="dark">Dark</AppButton>
          <AppButton variant="outline">Outline</AppButton>
          <AppButton variant="soft">Soft</AppButton>
          <AppButton variant="ghost">Ghost</AppButton>
          <AppButton variant="success">Success</AppButton>
          <AppButton variant="danger">Danger</AppButton>
          <AppButton variant="primary" leftIcon={<PlusIcon width={16} />}>
            With Icon
          </AppButton>
          <AppButton variant="soft" isDisabled>
            Disabled
          </AppButton>
        </Stack>

        <HStack spacing={3} flexWrap="wrap">
          <AppIconButton aria-label="bell" variant="soft" icon={<BellIcon width={16} />} />
          <AppIconButton aria-label="refresh" variant="dark" icon={<ArrowPathIcon width={16} />} />
          <AppIconButton aria-label="add" variant="primary" icon={<PlusIcon width={16} />} />
          <AppButton size="xs" variant="outline">
            XS
          </AppButton>
          <AppButton size="sm" variant="outline">
            SM
          </AppButton>
          <AppButton size="md" variant="outline">
            MD
          </AppButton>
          <AppButton size="lg" variant="outline">
            LG
          </AppButton>
        </HStack>
      </SectionBlock>

      <SectionBlock title="Form Controls" subtitle="Input types and validation states with and without icons">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <AppInput label="Text" placeholder="Enter full name" isRequired helperText="Required for account profile" />
          <AppInput
            label="Search"
            placeholder="Search package"
            leftElement={<MagnifyingGlassIcon width={16} />}
          />
          <AppInput
            label="Email"
            type="email"
            placeholder="name@company.com"
            leftElement={<EnvelopeIcon width={16} />}
            status="success"
            helperText="Looks good"
          />
          <AppInput
            label="Password"
            type="password"
            placeholder="Enter password"
            leftElement={<LockClosedIcon width={16} />}
            status="warning"
            helperText="Use at least 8 characters"
          />
          <AppInput label="Number" type="number" placeholder="0" />
          <AppInput
            label="Disabled"
            placeholder="Read-only state"
            isDisabled
            value="No edits"
            readOnly
          />
          <AppInput label="Error State" placeholder="Type value" error="This field is required" />
          <Box>
            <Text fontSize="13px" fontWeight="600" mb="8px">
              Select
            </Text>
            <AppSelect defaultValue="usd">
              <option value="usd">USD</option>
              <option value="uzs">UZS</option>
              <option value="eur">EUR</option>
            </AppSelect>
          </Box>
        </SimpleGrid>

        <AppTextarea
          label="Textarea"
          placeholder="Write longer content or notes"
          helperText="Supports multi-line form descriptions"
        />
      </SectionBlock>

      <SectionBlock title="Selection Controls" subtitle="Checkboxes, radio groups and switches with full states">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <VStack align="stretch" spacing={3}>
            <AppCheckbox
              label="Accept terms"
              description="Required before creating an account"
              isChecked={checkboxes.terms}
              onChange={(event) => setCheckboxes((prev) => ({ ...prev, terms: event.target.checked }))}
            />
            <AppCheckbox
              label="Marketing updates"
              description="Receive product news"
              isChecked={checkboxes.updates}
              onChange={(event) => setCheckboxes((prev) => ({ ...prev, updates: event.target.checked }))}
            />
            <AppCheckbox label="Beta program" isChecked={checkboxes.beta} isDisabled onChange={() => {}} />
          </VStack>

          <VStack align="stretch" spacing={4}>
            <AppRadioGroup
              label="Billing plan"
              name="billing-plan"
              value={selectedPlan}
              options={radioOptions}
              onChange={setSelectedPlan}
            />

            <AppSwitch
              label="Enable notifications"
              description="Send updates for critical account events"
              isChecked={isMarketingEnabled}
              onChange={(event) => setMarketingEnabled(event.target.checked)}
            />
            <AppSwitch
              label="Disabled switch"
              description="Controlled off state"
              isChecked={false}
              isDisabled
              size="sm"
              onChange={() => {}}
            />
          </VStack>
        </SimpleGrid>
      </SectionBlock>

      <SectionBlock title="Navigation Components" subtitle="Tabs, breadcrumbs, filter controls and pagination">
        <VStack align="stretch" spacing={5}>
          <AppBreadcrumbs
            items={[
              { label: "Dashboard" },
              { label: "Orders" },
              { label: "Order #A-1024" }
            ]}
          />

          <Box>
            <Text fontSize="sm" fontWeight="600" mb={2}>
              Filter Chips
            </Text>
            <FilterChips value={activeChip} options={chipOptions} onChange={setActiveChip} />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="600" mb={2}>
              Segmented Control
            </Text>
            <SegmentedControl value={activeSegment} options={chipOptions} onChange={setActiveSegment} />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="600" mb={2}>
              Underline Tabs
            </Text>
            <UnderlineTabs value={activeTab} options={tabOptions} onChange={setActiveTab} />
          </Box>

          <Pagination
            currentPage={currentPage}
            totalPages={12}
            totalItems={240}
            pageSize={20}
            itemLabel="items"
            onPageChange={setCurrentPage}
          />
        </VStack>
      </SectionBlock>

      <SectionBlock title="Status and Feedback" subtitle="Toasts, alerts, badges, and semantic states for errors and messaging">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          <VStack align="stretch" spacing={3}>
            <AppAlert
              status="error"
              title="Payment failed"
              description="Card was declined. Try another method or contact support."
              actionLabel="Retry"
              onAction={() => {}}
            />
            <AppAlert
              status="warning"
              title="Incomplete profile"
              description="Add missing company details to publish your offers."
            />
            <AppAlert
              status="success"
              title="Changes saved"
              description="Your pricing preferences were updated successfully."
              isCompact
            />
          </VStack>

          <VStack align="stretch" spacing={3}>
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorPalette="green">Default Badge</Badge>
              <Badge colorPalette="orange">In Progress</Badge>
              <Badge colorPalette="red">Critical</Badge>
              <StatusPill value={ORDER_STATUS_ACTIVE} labels={statusLabels} />
              <StatusPill value={ORDER_STATUS_PENDING} labels={statusLabels} />
              <StatusPill value={ORDER_STATUS_FAILED} labels={statusLabels} />
              <StatusPill value={ORDER_STATUS_EXPIRED} labels={statusLabels} />
            </HStack>

            <HStack spacing={2} flexWrap="wrap">
              <AppButton
                variant="soft"
                onClick={() =>
                  pushToast({
                    type: "success",
                    title: "Saved",
                    description: "Changes were stored successfully."
                  })
                }
              >
                Success Toast
              </AppButton>
              <AppButton
                variant="soft"
                onClick={() =>
                  pushToast({
                    type: "warning",
                    title: "Heads up",
                    description: "Something needs your attention."
                  })
                }
              >
                Warning Toast
              </AppButton>
              <AppButton
                variant="soft"
                onClick={() =>
                  pushToast({
                    type: "error",
                    title: "Request failed",
                    description: "Please retry in a moment."
                  })
                }
              >
                Error Toast
              </AppButton>
            </HStack>

            <Box>
              <Text fontSize="sm" fontWeight="600" mb={2}>
                Language Switcher
              </Text>
              <LanguageSwitcher />
            </Box>
          </VStack>
        </SimpleGrid>
      </SectionBlock>

      <SectionBlock title="Data Display" subtitle="Cards, package visuals, stepper and table layout patterns">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
          <StatCard
            label="Total Earnings"
            value="$12,450"
            helper="+14.3% this month"
            icon={<BanknotesIcon width={22} color={uiColors.accent} />}
          />
          <Box borderWidth="1px" borderColor={uiColors.border} borderRadius="2xl" p={5} bg="white">
            <Text fontSize="sm" color={uiColors.textSecondary} mb={3}>
              PackageDisplay
            </Text>
            <PackageDisplay countryCode="us" destination="United States" dataLabel="20 GB - 30 days" />
            <HStack spacing={3} mt={4}>
              <CountryFlag code="gb" size={20} />
              <CountryFlag code="jp" size={20} />
              <CountryFlag code="fr" size={20} />
              <CountryFlag code="xx" size={20} />
            </HStack>
          </Box>
        </Grid>

        <StepIndicator
          currentStep={2}
          steps={[
            { id: "step-1", label: "Customer details" },
            { id: "step-2", label: "Package selection" },
            { id: "step-3", label: "Payment and confirmation" }
          ]}
        />

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
      </SectionBlock>
    </VStack>
  );
}

export default DesignSystemPage;
