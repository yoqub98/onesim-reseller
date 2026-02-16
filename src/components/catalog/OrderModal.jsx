// Renders the buy flow modal with customer/group/self order modes — used in CatalogPage
import {
  CalendarDaysIcon,
  ClockIcon,
  CreditCardIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Box, Flex, Grid, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import CountryFlag from "../common/CountryFlag";
import { AppButton, AppSelect, SurfaceCard } from "../ui";
import {
  DELIVERY_EMAIL,
  DELIVERY_OPERATOR,
  DELIVERY_SMS
} from "../../constants/delivery";
import { uiColors, uiShadows } from "../../design-system/tokens";
import { formatMoneyFromUzs, formatMoneyPartsFromUzs } from "../../utils/currency";
import { formatPackageDataLabel } from "../../utils/package";
import CustomerInlineForm from "./CustomerInlineForm";

function OrderModal({
  t,
  currency,
  buyPlan,
  activeOrderTab,
  customers,
  groups,
  selectedGroups,
  isGroupPickerOpen,
  groupCandidateId,
  operatorHelperText,
  selfOrderHelperText,
  onClose,
  onTabChange,
  onCustomerAdd,
  onCustomerRemove,
  onCustomerUpdate,
  onGroupPickerToggle,
  onGroupCandidateChange,
  onGroupAdd,
  onGroupRemove,
  onConfirm
}) {
  if (!buyPlan) {
    return null;
  }

  const selectedIds = new Set(selectedGroups.map((group) => group.id));
  const availableGroups = groups.filter((group) => !selectedIds.has(group.id));
  const groupMemberCount = selectedGroups.reduce(
    (sum, group) => sum + (Array.isArray(group.members) ? group.members.length : 0),
    0
  );
  const effectiveCustomerCount =
    activeOrderTab === "group" ? groupMemberCount : activeOrderTab === "self" ? 1 : customers.length;
  const customerCount = Math.max(effectiveCustomerCount, 1);
  const packageUnitPrice = buyPlan.resellerPriceUzs || 0;
  const packageTotal = packageUnitPrice * customerCount;
  const partnerDiscount = Math.round(packageTotal * 0.05);
  const partnerProfit = partnerDiscount;
  const totalPayment = packageTotal - partnerDiscount;
  const totalPaymentParts = formatMoneyPartsFromUzs(totalPayment, currency);

  return (
    <Box position="fixed" inset={0} zIndex={45} bg="rgba(15, 23, 43, 0.45)" onClick={onClose}>
      <SurfaceCard
        position="absolute"
        top={{ base: 2, md: "50%" }}
        left="50%"
        transform={{ base: "translateX(-50%)", md: "translate(-50%, -50%)" }}
        w={{ base: "calc(100% - 8px)", md: "560px" }}
        maxH={{ base: "calc(100vh - 8px)", md: "calc(100vh - 32px)" }}
        borderRadius="14px"
        overflow="hidden"
        boxShadow="0px 25px 50px -12px rgba(0,0,0,0.25)"
        onClick={(event) => event.stopPropagation()}
      >
        <Flex px={5} h="64px" align="center" justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
          <Text fontWeight="800" fontSize={{ base: "lg", md: "20px" }} color={uiColors.textPrimary}>{t.modal.title}</Text>
          <IconButton aria-label="Yopish" icon={<XMarkIcon width={18} />} variant="ghost" onClick={onClose} />
        </Flex>

        <Grid templateColumns="repeat(3,1fr)" h="58px" borderBottomWidth="1px" borderColor={uiColors.border}>
          <Box
            borderBottomWidth="2px"
            borderColor={activeOrderTab === "self" ? uiColors.accent : "transparent"}
            bg={activeOrderTab === "self" ? "rgba(254,79,24,0.05)" : "transparent"}
            display="grid"
            placeItems="center"
            cursor="pointer"
            onClick={() => onTabChange("self")}
          >
            <HStack spacing={2} color={uiColors.textSecondary}><UserIcon width={15} /><Text fontSize="sm">{t.modal.tabSelf}</Text></HStack>
          </Box>
          <Box
            borderBottomWidth="2px"
            borderColor={activeOrderTab === "customer" ? uiColors.accent : "transparent"}
            bg={activeOrderTab === "customer" ? "rgba(254,79,24,0.05)" : "transparent"}
            display="grid"
            placeItems="center"
            cursor="pointer"
            onClick={() => onTabChange("customer")}
          >
            <HStack spacing={2} color={activeOrderTab === "customer" ? uiColors.accent : uiColors.textSecondary}><UserIcon width={15} /><Text fontSize="sm">{t.modal.tabCustomer}</Text></HStack>
          </Box>
          <Box
            borderBottomWidth="2px"
            borderColor={activeOrderTab === "group" ? uiColors.accent : "transparent"}
            bg={activeOrderTab === "group" ? "rgba(254,79,24,0.05)" : "transparent"}
            display="grid"
            placeItems="center"
            cursor="pointer"
            onClick={() => onTabChange("group")}
          >
            <HStack spacing={2} color={activeOrderTab === "group" ? uiColors.accent : uiColors.textSecondary}><UsersIcon width={15} /><Text fontSize="sm">{t.modal.tabGroup}</Text></HStack>
          </Box>
        </Grid>

        <Box bg="rgba(248,250,252,0.6)" px={5} py={7} maxH={{ base: "54vh", md: "500px" }} overflowY="auto">
          <SurfaceCard p={4} boxShadow={uiShadows.soft} mb={8}>
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <CountryFlag code={buyPlan.countryCode} size={32} />
                <Box>
                  <Text fontSize="sm" fontWeight="700" color={uiColors.textPrimary}>{buyPlan.destination}</Text>
                  <Text fontSize="sm" color={uiColors.textSecondary}>{formatPackageDataLabel(buyPlan, t.units.unlimited)} • {buyPlan.validityDays} {t.units.day}</Text>
                </Box>
              </HStack>
              <Text fontSize={{ base: "22px", md: "26px" }} fontWeight="700" color={uiColors.textPrimary}>
                {formatMoneyFromUzs(packageUnitPrice, currency)}
              </Text>
            </Flex>
          </SurfaceCard>

          {activeOrderTab === "group" ? (
            <>
              <Flex justify="space-between" align="center" mb={5}>
                <Text fontWeight="700" fontSize={{ base: "16px", md: "18px" }} color="#0a0a0a">
                  {t.modal.groups} ({selectedGroups.length})
                </Text>
                <AppButton
                  variant="ghost"
                  h="32px"
                  borderRadius="26px"
                  borderColor="#8294ac"
                  borderWidth="1px"
                  leftIcon={<PlusIcon width={14} />}
                  onClick={onGroupPickerToggle}
                >
                  {t.modal.addGroup}
                </AppButton>
              </Flex>

              {isGroupPickerOpen ? (
                <SurfaceCard p={3} mb={5} boxShadow={uiShadows.soft}>
                  <Text fontSize="sm" color={uiColors.textPrimary} mb={2} fontWeight="600">
                    {t.modal.selectGroup}
                  </Text>
                  <HStack>
                    <AppSelect
                      flex="1"
                      value={groupCandidateId}
                      onChange={(event) => onGroupCandidateChange(event.target.value)}
                    >
                      <option value="">{t.modal.select}</option>
                      {availableGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.members.length})
                        </option>
                      ))}
                    </AppSelect>
                    <AppButton variant="primary" leftIcon={<PlusIcon width={14} />} onClick={onGroupAdd}>{t.modal.add}</AppButton>
                  </HStack>
                </SurfaceCard>
              ) : null}

              <VStack align="stretch" spacing={6}>
                {selectedGroups.map((group) => (
                  <SurfaceCard key={group.id} position="relative" p={3} borderRadius="13px" boxShadow="0px 1px 16.8px rgba(0,0,0,0.17)">
                    <IconButton
                      aria-label="Guruhni o'chirish"
                      size="xs"
                      variant="ghost"
                      color="#b91c1c"
                      bg="#fef2f2"
                      _hover={{ bg: "#fee2e2", color: "#991b1b" }}
                      position="absolute"
                      top={2.5}
                      right={2.5}
                      onClick={() => onGroupRemove(group.id)}
                    >
                      <TrashIcon width={15} />
                    </IconButton>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <UsersIcon width={14} color="#64748b" />
                        <Text fontWeight="700" fontSize="sm" color="#0a0e1a">{group.name}</Text>
                      </HStack>
                      <Text fontSize="sm" color={uiColors.accent} fontWeight="500" pr={8}>
                        {t.modal.totalCustomers} : {group.members.length} {t.modal.customers.toLowerCase()}
                      </Text>
                    </HStack>
                    <VStack align="stretch" spacing={2}>
                      {group.members.map((member) => (
                        <Flex
                          key={`${group.id}-${member.name}-${member.phone}`}
                          justify="space-between"
                          bg="#f8fafc"
                          borderWidth="1px"
                          borderColor="#f1f5f9"
                          borderRadius="10px"
                          px={3}
                          py={2.5}
                        >
                          <Text fontSize="sm" color={uiColors.textPrimary} fontWeight="500">{member.name}</Text>
                          <Text fontSize="sm" color={uiColors.textSecondary}>{member.phone || member.email}</Text>
                        </Flex>
                      ))}
                    </VStack>
                  </SurfaceCard>
                ))}
              </VStack>

              {selectedGroups.length > 0 ? (
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3} pt={5} mt={5} borderTopWidth="1px" borderColor="#f1f5f9">
                  <Box>
                    <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryMethod}</Text>
                    <AppSelect
                      h="36px"
                      value={selectedGroups[0]?.deliveryMethod || DELIVERY_SMS}
                      leftIcon={(selectedGroups[0]?.deliveryMethod || DELIVERY_SMS) === DELIVERY_SMS ? <PhoneIcon width={14} /> : (selectedGroups[0]?.deliveryMethod || DELIVERY_SMS) === DELIVERY_EMAIL ? <EnvelopeIcon width={14} /> : <UsersIcon width={14} />}
                      isDisabled
                    >
                      <option value={DELIVERY_SMS}>{t.modal.methods.sms}</option>
                      <option value={DELIVERY_EMAIL}>{t.modal.methods.email}</option>
                      <option value={DELIVERY_OPERATOR}>{t.modal.methods.operator}</option>
                    </AppSelect>
                  </Box>
                  {(selectedGroups[0]?.deliveryMethod || DELIVERY_SMS) !== DELIVERY_OPERATOR ? (
                    <Box>
                      <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryTime}</Text>
                      <AppSelect
                        h="36px"
                        value={selectedGroups[0]?.deliveryTime || "now"}
                        leftIcon={(selectedGroups[0]?.deliveryTime || "now") === "scheduled" ? <CalendarDaysIcon width={14} /> : <ClockIcon width={14} />}
                        isDisabled
                      >
                        <option value="now">{t.modal.timeModes.now}</option>
                        <option value="scheduled">{t.modal.timeModes.scheduled}</option>
                      </AppSelect>
                    </Box>
                  ) : (
                    <Box gridColumn={{ base: "1", sm: "1 / -1" }}>
                      <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryInfo}</Text>
                      <HStack
                        borderWidth="1px"
                        borderColor="#d1d9e4"
                        borderRadius="8px"
                        bg="#f8fafc"
                        px={3}
                        py={2.5}
                        align="start"
                        spacing={2}
                      >
                        <InformationCircleIcon width={16} color="#62748e" />
                        <Text fontSize="xs" color="#62748e" lineHeight="1.4">{operatorHelperText}</Text>
                      </HStack>
                    </Box>
                  )}
                </Grid>
              ) : null}
            </>
          ) : activeOrderTab === "self" ? (
            <SurfaceCard p={4} borderRadius="12px" boxShadow={uiShadows.soft}>
              <HStack
                borderWidth="1px"
                borderColor="#d1d9e4"
                borderRadius="10px"
                bg="#f8fafc"
                px={3}
                py={3}
                align="start"
                spacing={2}
              >
                <InformationCircleIcon width={18} color="#62748e" />
                <Text fontSize="sm" color="#475569" lineHeight="1.45">
                  {selfOrderHelperText}
                </Text>
              </HStack>
            </SurfaceCard>
          ) : (
            <>
              <Flex justify="space-between" align="center" mb={5}>
                <Text fontWeight="700" fontSize={{ base: "16px", md: "18px" }} color="#0a0a0a">{t.modal.customers} ({customers.length})</Text>
                <AppButton variant="ghost" h="32px" borderRadius="26px" borderColor="#8294ac" borderWidth="1px" leftIcon={<PlusIcon width={14} />} onClick={onCustomerAdd}>
                  {t.modal.addCustomer}
                </AppButton>
              </Flex>

              <VStack align="stretch" spacing={6}>
                {customers.map((customer, index) => (
                  <CustomerInlineForm
                    key={customer.id}
                    t={t}
                    customer={customer}
                    index={index}
                    canRemove={customers.length > 1}
                    operatorHelperText={operatorHelperText}
                    onUpdate={(patch) => onCustomerUpdate(customer.id, patch)}
                    onRemove={() => onCustomerRemove(customer.id)}
                  />
                ))}
              </VStack>
            </>
          )}

          <Text mt={10} mb={5} fontWeight="700" fontSize="sm" color="#0a0a0a">{t.modal.paymentMethod}</Text>
          <Box bg="rgba(254,79,24,0.05)" borderWidth="1px" borderColor="rgba(254,79,24,0.2)" borderRadius="10px" px={3} py={4}>
            <HStack spacing={3}>
              <Box w="38px" h="38px" borderRadius="4px" bg="white" borderWidth="1px" borderColor={uiColors.border} display="grid" placeItems="center">
                <CreditCardIcon width={16} color={uiColors.accent} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="700" color={uiColors.textPrimary}>Visa kartasi *4242</Text>
                <Text fontSize="xs" color={uiColors.textSecondary}>Balans: {formatMoneyFromUzs(45000000, currency)}</Text>
              </Box>
            </HStack>
          </Box>
        </Box>

        <Box borderTopWidth="1px" borderColor={uiColors.border} bg="white" px={5} py={5}>
          <VStack align="stretch" spacing={2} mb={3}>
            <HStack justify="space-between">
              <Text fontSize="sm" color="#45556c">{t.modal.summary.packagePrice} ({customerCount} ta)</Text>
              <Text fontSize="sm" color="#45556c">{formatMoneyFromUzs(packageTotal, currency)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="#00a63e" fontWeight="600">{t.modal.summary.partnerDiscount}</Text>
              <Text fontSize="sm" color="#00a63e">- {formatMoneyFromUzs(partnerDiscount, currency)}</Text>
            </HStack>
            <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="#f1f5f9">
              <Text fontSize="sm" color="#45556c">{t.modal.summary.partnerProfit}</Text>
              <Box bg="#dcfce7" borderRadius="4px" px={2} py={0.5}>
                <Text fontSize="sm" color="#008236" fontWeight="700">{formatMoneyFromUzs(partnerProfit, currency)}</Text>
              </Box>
            </HStack>
          </VStack>

          <HStack justify="space-between" mb={3}>
            <Text fontSize="lg" fontWeight="700" color={uiColors.textPrimary}>{t.modal.summary.total}</Text>
            <Text fontSize={{ base: "24px", md: "26px" }} fontWeight="800" lineHeight="1" color="#171717">
              {totalPaymentParts.prefix}{totalPaymentParts.amount} <Text as="span" color="#b4b4b4" fontSize={{ base: "24px", md: "26px" }} fontWeight="600">{totalPaymentParts.code}</Text>
            </Text>
          </HStack>

          <HStack spacing={3}>
            <AppButton variant="soft" h="51px" flex="1" onClick={onClose}>{t.modal.cancel}</AppButton>
            <AppButton variant="primary" h="51px" flex="1" onClick={onConfirm}>{t.modal.confirm}</AppButton>
          </HStack>
        </Box>
      </SurfaceCard>
    </Box>
  );
}

export default OrderModal;
