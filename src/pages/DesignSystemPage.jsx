import { useMemo, useState } from "react";
import {
  Box,
  Code,
  Heading,
  HStack,
  SimpleGrid,
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
  UserIcon
} from "@heroicons/react/24/outline";
import { BanknotesIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import PageHeader from "../components/layout/PageHeader";
import {
  AppAlert,
  AppAvatar,
  AppAvatarGroup,
  AppBadge,
  AppBreadcrumbs,
  AppButton,
  AppCheckbox,
  AppCountBadge,
  AppDataTable,
  AppDataTableCell,
  AppDataTableRow,
  AppDivider,
  AppIconButton,
  AppInput,
  AppProgress,
  AppProgressCircle,
  AppProgressSteps,
  AppRadioGroup,
  AppSelect,
  AppSkeleton,
  AppSkeletonText,
  AppSwitch,
  AppTextarea,
  AppTooltip,
  AppVerticalDivider,
  FilterChips,
  InfoTooltip,
  PackageDisplay,
  Pagination,
  SegmentedControl,
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
  uiColors,
  uiControlSizes,
  uiRadii,
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
  { value: "monthly", label: "Monthly", description: "Billed every 30 days" },
  { value: "yearly", label: "Yearly", description: "2 months free" },
  { value: "enterprise", label: "Enterprise", description: "Custom quote", disabled: true }
];

function SectionHeader({ title, description }) {
  return (
    <Box mb={6}>
      <Heading size="md" color={uiColors.textPrimary} mb={1}>
        {title}
      </Heading>
      {description && (
        <Text fontSize="14px" color={uiColors.textSecondary}>
          {description}
        </Text>
      )}
    </Box>
  );
}

function ComponentCard({ title, children }) {
  return (
    <Box
      bg="white"
      borderRadius={uiRadii.lg}
      border="1px solid"
      borderColor={uiColors.border}
      overflow="hidden"
    >
      <Box px={5} py={3} bg={uiColors.surfaceElevated} borderBottom="1px solid" borderColor={uiColors.border}>
        <Text fontSize="13px" fontWeight="600" color={uiColors.textPrimary}>
          {title}
        </Text>
      </Box>
      <Box p={5}>{children}</Box>
    </Box>
  );
}

function TokenSwatch({ name, value }) {
  return (
    <HStack
      spacing={3}
      p={3}
      bg="white"
      borderRadius={uiRadii.md}
      border="1px solid"
      borderColor={uiColors.border}
    >
      <Box
        w="40px"
        h="40px"
        borderRadius={uiRadii.sm}
        bg={value}
        border="1px solid"
        borderColor={uiColors.border}
        flexShrink={0}
      />
      <Box flex={1} minW={0}>
        <Text fontSize="12px" fontWeight="600" color={uiColors.textPrimary} isTruncated>
          {name}
        </Text>
        <Code fontSize="10px" bg="transparent" p={0} color={uiColors.textMuted}>
          {String(value)}
        </Code>
      </Box>
    </HStack>
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
  const [progressValue] = useState(65);
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

  const colorTokens = Object.entries(uiColors).filter(
    ([, value]) => typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb"))
  );

  return (
    <VStack align="stretch" spacing={0} w="full">
      <AppToastStack items={toasts} />

      <PageHeader
        title="Design System"
        subtitle="Atomic, tokenized component library for building clean and scalable UI"
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

      {/* SECTION: Design Tokens */}
      <Box mt={10}>
        <SectionHeader
          title="Design Tokens"
          description="Core visual language: colors, spacing, radii, shadows, and typography"
        />

        <VStack align="stretch" spacing={6}>
          <ComponentCard title="Color Palette">
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={3}>
              {colorTokens.map(([key, value]) => (
                <TokenSwatch key={key} name={key} value={value} />
              ))}
            </SimpleGrid>
          </ComponentCard>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <ComponentCard title="Border Radius">
              <VStack align="stretch" spacing={2}>
                {Object.entries(uiRadii).map(([k, v]) => (
                  <HStack key={k} justify="space-between">
                    <Text fontSize="13px" color={uiColors.textSecondary}>{k}</Text>
                    <Code fontSize="12px">{v}</Code>
                  </HStack>
                ))}
              </VStack>
            </ComponentCard>

            <ComponentCard title="Spacing Scale">
              <VStack align="stretch" spacing={2}>
                {Object.entries(uiSpacing).slice(0, 8).map(([k, v]) => (
                  <HStack key={k} justify="space-between">
                    <Text fontSize="13px" color={uiColors.textSecondary}>{k}</Text>
                    <Code fontSize="12px">{v}</Code>
                  </HStack>
                ))}
              </VStack>
            </ComponentCard>

            <ComponentCard title="Control Sizes">
              <VStack align="stretch" spacing={2}>
                {Object.entries(uiControlSizes).map(([k, v]) => (
                  <HStack key={k} justify="space-between">
                    <Text fontSize="13px" color={uiColors.textSecondary}>{k}</Text>
                    <Code fontSize="12px">h: {v.h}</Code>
                  </HStack>
                ))}
              </VStack>
            </ComponentCard>
          </SimpleGrid>

          <ComponentCard title="Typography Scale">
            <VStack align="stretch" spacing={4}>
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
            </VStack>
          </ComponentCard>
        </VStack>
      </Box>

      {/* SECTION: Buttons */}
      <Box mt={12}>
        <SectionHeader
          title="Buttons"
          description="Primary actions, variants, sizes, and icon buttons"
        />

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          <ComponentCard title="Button Variants">
            <HStack spacing={3} flexWrap="wrap">
              <AppButton variant="primary">Primary</AppButton>
              <AppButton variant="dark">Dark</AppButton>
              <AppButton variant="outline">Outline</AppButton>
              <AppButton variant="soft">Soft</AppButton>
              <AppButton variant="ghost">Ghost</AppButton>
              <AppButton variant="success">Success</AppButton>
              <AppButton variant="danger">Danger</AppButton>
            </HStack>
          </ComponentCard>

          <ComponentCard title="Button States & Sizes">
            <VStack align="stretch" spacing={4}>
              <HStack spacing={3} flexWrap="wrap">
                <AppButton variant="primary" leftIcon={<PlusIcon width={16} />}>
                  With Icon
                </AppButton>
                <AppButton variant="soft" isDisabled>
                  Disabled
                </AppButton>
                <AppButton variant="outline" isLoading>
                  Loading
                </AppButton>
              </HStack>
              <HStack spacing={3} flexWrap="wrap">
                <AppButton size="xs" variant="outline">XS</AppButton>
                <AppButton size="sm" variant="outline">SM</AppButton>
                <AppButton size="md" variant="outline">MD</AppButton>
                <AppButton size="lg" variant="outline">LG</AppButton>
              </HStack>
            </VStack>
          </ComponentCard>

          <ComponentCard title="Icon Buttons">
            <HStack spacing={3}>
              <AppIconButton aria-label="bell" variant="soft" icon={<BellIcon width={18} />} />
              <AppIconButton aria-label="refresh" variant="dark" icon={<ArrowPathIcon width={18} />} />
              <AppIconButton aria-label="add" variant="primary" icon={<PlusIcon width={18} />} />
              <AppIconButton aria-label="user" variant="outline" icon={<UserIcon width={18} />} />
            </HStack>
          </ComponentCard>
        </SimpleGrid>
      </Box>

      {/* SECTION: Form Controls */}
      <Box mt={12}>
        <SectionHeader
          title="Form Controls"
          description="Input fields, selects, textareas with validation states"
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <ComponentCard title="Text Inputs">
            <VStack align="stretch" spacing={4}>
              <AppInput
                label="Full Name"
                placeholder="Enter your name"
                isRequired
                helperText="Required for account profile"
              />
              <AppInput
                label="Search"
                placeholder="Search packages..."
                leftElement={<MagnifyingGlassIcon width={16} />}
              />
            </VStack>
          </ComponentCard>

          <ComponentCard title="Input States">
            <VStack align="stretch" spacing={4}>
              <AppInput
                label="Email (Success)"
                type="email"
                placeholder="name@company.com"
                leftElement={<EnvelopeIcon width={16} />}
                status="success"
                helperText="Email verified"
              />
              <AppInput
                label="Password (Warning)"
                type="password"
                placeholder="Enter password"
                leftElement={<LockClosedIcon width={16} />}
                status="warning"
                helperText="Use at least 8 characters"
              />
              <AppInput
                label="Error State"
                placeholder="Type value"
                error="This field is required"
              />
              <AppInput
                label="Disabled"
                placeholder="Read-only"
                isDisabled
                value="Cannot edit"
              />
            </VStack>
          </ComponentCard>

          <ComponentCard title="Select & Textarea">
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontSize="13px" fontWeight="600" mb="8px">Currency</Text>
                <AppSelect defaultValue="usd">
                  <option value="usd">USD - US Dollar</option>
                  <option value="uzs">UZS - Uzbek Sum</option>
                  <option value="eur">EUR - Euro</option>
                </AppSelect>
              </Box>
              <AppTextarea
                label="Notes"
                placeholder="Write additional notes..."
                helperText="Optional description"
              />
            </VStack>
          </ComponentCard>
        </SimpleGrid>
      </Box>

      {/* SECTION: Selection Controls */}
      <Box mt={12}>
        <SectionHeader
          title="Selection Controls"
          description="Checkboxes, radio groups, and toggle switches"
        />

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          <ComponentCard title="Checkboxes">
            <VStack align="stretch" spacing={3}>
              <AppCheckbox
                label="Accept terms"
                description="Required before creating an account"
                isChecked={checkboxes.terms}
                onChange={(e) => setCheckboxes((p) => ({ ...p, terms: e.target.checked }))}
              />
              <AppCheckbox
                label="Marketing updates"
                description="Receive product news"
                isChecked={checkboxes.updates}
                onChange={(e) => setCheckboxes((p) => ({ ...p, updates: e.target.checked }))}
              />
              <AppCheckbox
                label="Beta program (disabled)"
                isChecked={checkboxes.beta}
                isDisabled
                onChange={() => {}}
              />
            </VStack>
          </ComponentCard>

          <ComponentCard title="Radio Group">
            <AppRadioGroup
              label="Billing Plan"
              name="billing-plan"
              value={selectedPlan}
              options={radioOptions}
              onChange={setSelectedPlan}
            />
          </ComponentCard>

          <ComponentCard title="Switches">
            <VStack align="stretch" spacing={4}>
              <AppSwitch
                label="Enable notifications"
                description="Send updates for critical events"
                isChecked={isMarketingEnabled}
                onChange={(e) => setMarketingEnabled(e.target.checked)}
              />
              <AppSwitch
                label="Disabled switch"
                description="Cannot be changed"
                isChecked={false}
                isDisabled
                onChange={() => {}}
              />
            </VStack>
          </ComponentCard>
        </SimpleGrid>
      </Box>

      {/* SECTION: Navigation */}
      <Box mt={12}>
        <SectionHeader
          title="Navigation"
          description="Tabs, breadcrumbs, filter controls, and pagination"
        />

        <VStack align="stretch" spacing={4}>
          <ComponentCard title="Breadcrumbs">
            <AppBreadcrumbs
              items={[
                { label: "Dashboard" },
                { label: "Orders" },
                { label: "Order #A-1024" }
              ]}
            />
          </ComponentCard>

          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
            <ComponentCard title="Filter Chips">
              <FilterChips value={activeChip} options={chipOptions} onChange={setActiveChip} />
            </ComponentCard>

            <ComponentCard title="Segmented Control">
              <SegmentedControl value={activeSegment} options={chipOptions} onChange={setActiveSegment} />
            </ComponentCard>

            <ComponentCard title="Underline Tabs">
              <UnderlineTabs value={activeTab} options={tabOptions} onChange={setActiveTab} />
            </ComponentCard>
          </SimpleGrid>

          <ComponentCard title="Pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={12}
              totalItems={240}
              pageSize={20}
              itemLabel="items"
              onPageChange={setCurrentPage}
            />
          </ComponentCard>
        </VStack>
      </Box>

      {/* SECTION: Data Display */}
      <Box mt={12}>
        <SectionHeader
          title="Data Display"
          description="Avatars, badges, stat cards, progress indicators"
        />

        <VStack align="stretch" spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <ComponentCard title="Avatars">
              <VStack align="start" spacing={4}>
                <HStack spacing={3}>
                  <AppAvatar size="xs" name="John Doe" />
                  <AppAvatar size="sm" name="Jane Smith" />
                  <AppAvatar size="md" name="Bob Wilson" />
                  <AppAvatar size="lg" name="Alice Brown" />
                </HStack>
                <HStack spacing={3}>
                  <AppAvatar size="md" name="Online User" status="online" />
                  <AppAvatar size="md" name="Away User" status="away" />
                  <AppAvatar size="md" name="Busy User" status="busy" />
                  <AppAvatar size="md" />
                </HStack>
                <AppAvatarGroup size="md" max={3}>
                  <AppAvatar name="User 1" showBorder />
                  <AppAvatar name="User 2" showBorder />
                  <AppAvatar name="User 3" showBorder />
                  <AppAvatar name="User 4" showBorder />
                  <AppAvatar name="User 5" showBorder />
                </AppAvatarGroup>
              </VStack>
            </ComponentCard>

            <ComponentCard title="Badges">
              <VStack align="start" spacing={3}>
                <HStack spacing={2} flexWrap="wrap">
                  <AppBadge>Default</AppBadge>
                  <AppBadge variant="primary">Primary</AppBadge>
                  <AppBadge variant="success">Success</AppBadge>
                  <AppBadge variant="warning">Warning</AppBadge>
                  <AppBadge variant="error">Error</AppBadge>
                </HStack>
                <HStack spacing={2}>
                  <AppBadge variant="success" dot>Active</AppBadge>
                  <AppBadge variant="outline" isRounded>Rounded</AppBadge>
                </HStack>
                <HStack spacing={2}>
                  <AppCountBadge count={5} />
                  <AppCountBadge count={42} />
                  <AppCountBadge count={150} />
                </HStack>
              </VStack>
            </ComponentCard>

            <ComponentCard title="Status Pills">
              <VStack align="start" spacing={2}>
                <StatusPill value={ORDER_STATUS_ACTIVE} labels={statusLabels} />
                <StatusPill value={ORDER_STATUS_PENDING} labels={statusLabels} />
                <StatusPill value={ORDER_STATUS_FAILED} labels={statusLabels} />
                <StatusPill value={ORDER_STATUS_EXPIRED} labels={statusLabels} />
              </VStack>
            </ComponentCard>

            <ComponentCard title="Tooltips">
              <HStack spacing={4}>
                <AppTooltip label="This is a tooltip" placement="top">
                  <AppButton size="sm" variant="soft">Hover me</AppButton>
                </AppTooltip>
                <HStack spacing={2}>
                  <Text fontSize="13px">Info</Text>
                  <InfoTooltip label="Helpful information goes here" />
                </HStack>
              </HStack>
            </ComponentCard>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <ComponentCard title="Stat Cards">
              <SimpleGrid columns={2} spacing={3}>
                <StatCard
                  label="Revenue"
                  value="$12,450"
                  trend="14.3%"
                  trendDirection="up"
                  helper="this month"
                  icon={<BanknotesIcon width={20} />}
                />
                <StatCard
                  label="Orders"
                  value="284"
                  trend="8.1%"
                  trendDirection="up"
                  icon={<ShoppingCartIcon width={20} />}
                />
              </SimpleGrid>
            </ComponentCard>

            <ComponentCard title="Progress Indicators">
              <VStack align="stretch" spacing={4}>
                <AppProgress value={progressValue} showLabel label="Storage used" />
                <AppProgress value={80} variant="success" size="sm" />
                <AppProgress value={45} variant="warning" size="lg" />
                <HStack spacing={4}>
                  <AppProgressCircle value={75} size={56} />
                  <AppProgressCircle value={45} variant="warning" size={56} />
                  <AppProgressCircle value={90} variant="success" size={56} />
                </HStack>
                <Box>
                  <Text fontSize="12px" color={uiColors.textMuted} mb={2}>Step Progress</Text>
                  <AppProgressSteps steps={[1, 2, 3, 4, 5]} currentStep={3} />
                </Box>
              </VStack>
            </ComponentCard>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* SECTION: Feedback */}
      <Box mt={12}>
        <SectionHeader
          title="Feedback"
          description="Alerts, toasts, and notification patterns"
        />

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          <ComponentCard title="Alerts">
            <VStack align="stretch" spacing={3}>
              <AppAlert
                status="info"
                title="Information"
                description="Here's some helpful context for the user."
              />
              <AppAlert
                status="success"
                title="Changes saved"
                description="Your preferences were updated successfully."
                isCompact
              />
              <AppAlert
                status="warning"
                title="Incomplete profile"
                description="Add missing details to continue."
              />
              <AppAlert
                status="error"
                title="Payment failed"
                description="Card was declined. Try another method."
                actionLabel="Retry"
                onAction={() => {}}
              />
            </VStack>
          </ComponentCard>

          <ComponentCard title="Toast Triggers">
            <VStack align="stretch" spacing={3}>
              <HStack spacing={2} flexWrap="wrap">
                <AppButton
                  size="sm"
                  variant="soft"
                  onClick={() => pushToast({ type: "success", title: "Saved", description: "Changes stored." })}
                >
                  Success Toast
                </AppButton>
                <AppButton
                  size="sm"
                  variant="soft"
                  onClick={() => pushToast({ type: "warning", title: "Warning", description: "Check your input." })}
                >
                  Warning Toast
                </AppButton>
                <AppButton
                  size="sm"
                  variant="soft"
                  onClick={() => pushToast({ type: "error", title: "Error", description: "Something went wrong." })}
                >
                  Error Toast
                </AppButton>
              </HStack>
              <Box>
                <Text fontSize="12px" color={uiColors.textMuted} mb={2}>Language Switcher</Text>
                <LanguageSwitcher />
              </Box>
            </VStack>
          </ComponentCard>
        </SimpleGrid>
      </Box>

      {/* SECTION: Layout Components */}
      <Box mt={12}>
        <SectionHeader
          title="Layout & Utility"
          description="Dividers, skeletons, and structural components"
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <ComponentCard title="Dividers">
            <VStack align="stretch" spacing={4}>
              <AppDivider />
              <AppDivider variant="dashed" />
              <AppDivider label="OR" />
              <HStack h="40px">
                <Text fontSize="13px">Item A</Text>
                <AppVerticalDivider />
                <Text fontSize="13px">Item B</Text>
                <AppVerticalDivider />
                <Text fontSize="13px">Item C</Text>
              </HStack>
            </VStack>
          </ComponentCard>

          <ComponentCard title="Skeleton Loaders">
            <VStack align="stretch" spacing={4}>
              <HStack spacing={3}>
                <AppSkeleton w="60px" h="60px" borderRadius="50%" />
                <VStack align="stretch" flex={1} spacing={2}>
                  <AppSkeleton h="14px" w="50%" />
                  <AppSkeleton h="14px" w="80%" />
                </VStack>
              </HStack>
              <AppSkeletonText lines={3} />
            </VStack>
          </ComponentCard>
        </SimpleGrid>
      </Box>

      {/* SECTION: Complex Components */}
      <Box mt={12} mb={10}>
        <SectionHeader
          title="Complex Components"
          description="Step indicators, tables, and composite patterns"
        />

        <VStack align="stretch" spacing={4}>
          <ComponentCard title="Step Indicator">
            <StepIndicator
              currentStep={2}
              steps={[
                { id: "step-1", label: "Customer details" },
                { id: "step-2", label: "Package selection" },
                { id: "step-3", label: "Payment" }
              ]}
            />
          </ComponentCard>

          <ComponentCard title="Data Table">
            <AppDataTable
              minWidth="700px"
              columns="1.5fr 1fr 0.8fr 0.8fr"
              headers={["Package", "Customer", "Status", "Amount"]}
            >
              <AppDataTableRow columns="1.5fr 1fr 0.8fr 0.8fr">
                <AppDataTableCell>
                  <PackageDisplay countryCode="us" destination="United States" dataLabel="10 GB - 30 days" />
                </AppDataTableCell>
                <AppDataTableCell>john@example.com</AppDataTableCell>
                <AppDataTableCell>
                  <StatusPill value={ORDER_STATUS_ACTIVE} labels={statusLabels} />
                </AppDataTableCell>
                <AppDataTableCell align="right">$25.00</AppDataTableCell>
              </AppDataTableRow>
              <AppDataTableRow columns="1.5fr 1fr 0.8fr 0.8fr">
                <AppDataTableCell>
                  <PackageDisplay countryCode="gb" destination="United Kingdom" dataLabel="5 GB - 14 days" />
                </AppDataTableCell>
                <AppDataTableCell>sarah@example.com</AppDataTableCell>
                <AppDataTableCell>
                  <StatusPill value={ORDER_STATUS_PENDING} labels={statusLabels} />
                </AppDataTableCell>
                <AppDataTableCell align="right">$19.00</AppDataTableCell>
              </AppDataTableRow>
            </AppDataTable>
          </ComponentCard>

          <ComponentCard title="Package Display & Flags">
            <HStack spacing={6} flexWrap="wrap">
              <PackageDisplay countryCode="jp" destination="Japan" dataLabel="Unlimited - 7 days" />
              <HStack spacing={3}>
                <CountryFlag code="de" size={24} />
                <CountryFlag code="fr" size={24} />
                <CountryFlag code="it" size={24} />
                <CountryFlag code="es" size={24} />
              </HStack>
            </HStack>
          </ComponentCard>
        </VStack>
      </Box>
    </VStack>
  );
}

export default DesignSystemPage;
