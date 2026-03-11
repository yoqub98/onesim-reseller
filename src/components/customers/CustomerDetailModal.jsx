/**
 * CustomerDetailModal - Customer info with order history
 */
import {
  ArrowTopRightOnSquareIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { uiColors, uiRadii } from "../../design-system/tokens";
import {
  AppButton,
  AppIconButton,
  DataUsageBar,
  SurfaceCard
} from "../ui";
import { CUSTOMER_STATUS } from "../../mock/customersMock";

function formatDate(dateString) {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function CustomerStatusBadge({ status, t }) {
  const config = {
    [CUSTOMER_STATUS.ACTIVE]: {
      label: t?.statusLabels?.active || "Faol",
      bg: uiColors.successSoft,
      color: uiColors.success
    },
    [CUSTOMER_STATUS.INACTIVE]: {
      label: t?.statusLabels?.inactive || "Faol emas",
      bg: uiColors.warningSoft,
      color: uiColors.warning
    },
    [CUSTOMER_STATUS.NEW]: {
      label: t?.statusLabels?.new || "Yangi",
      bg: uiColors.accentSoft,
      color: uiColors.accent
    }
  };

  const style = config[status] || config[CUSTOMER_STATUS.INACTIVE];

  return (
    <Badge
      bg={style.bg}
      color={style.color}
      fontWeight="600"
      fontSize="11px"
      px={2.5}
      py={0.5}
      borderRadius="999px"
      textTransform="uppercase"
    >
      {style.label}
    </Badge>
  );
}

function OrderStatusBadge({ status }) {
  const config = {
    active: { label: "Faol", bg: uiColors.successSoft, color: uiColors.success },
    not_active: { label: "Kutilmoqda", bg: uiColors.warningSoft, color: uiColors.warning },
    expired: { label: "Tugagan", bg: uiColors.surfaceSoft, color: uiColors.textMuted },
    depleted: { label: "Tugagan", bg: uiColors.errorSoft, color: uiColors.error }
  };

  const style = config[status] || config.not_active;

  return (
    <Badge
      bg={style.bg}
      color={style.color}
      fontWeight="600"
      fontSize="10px"
      px={2}
      py={0.5}
      borderRadius="999px"
    >
      {style.label}
    </Badge>
  );
}

export function CustomerDetailModal({
  customer,
  t,
  formatPrice,
  onClose,
  onCopy
}) {
  const navigate = useNavigate();

  if (!customer) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        inset={0}
        bg="rgba(15, 23, 43, 0.48)"
        backdropFilter="blur(2px)"
        zIndex={40}
        onClick={onClose}
      />

      {/* Modal */}
      <Box
        position="fixed"
        inset={0}
        zIndex={50}
        display="grid"
        placeItems="center"
        p={4}
      >
        <SurfaceCard
          w="full"
          maxW="700px"
          borderRadius={uiRadii.lg}
          overflow="hidden"
        >
          {/* Header */}
          <HStack
            px={5}
            py={4}
            justify="space-between"
            borderBottomWidth="1px"
            borderColor={uiColors.border}
          >
            <HStack spacing={3}>
              <Box>
                <HStack spacing={2}>
                  <Text fontWeight="800" fontSize="xl" color={uiColors.textPrimary}>
                    {customer.name}
                  </Text>
                  <CustomerStatusBadge status={customer.status} t={t} />
                </HStack>
                <Text fontSize="sm" color={uiColors.textSecondary} fontFamily="mono">
                  {customer.id}
                </Text>
              </Box>
            </HStack>
            <AppIconButton
              variant="ghost"
              aria-label={t?.modal?.close || "Yopish"}
              icon={<XMarkIcon width={18} />}
              onClick={onClose}
            />
          </HStack>

          {/* Content */}
          <VStack align="stretch" spacing={5} p={5} maxH="70vh" overflowY="auto">
            {/* Contact Info */}
            <HStack spacing={6} flexWrap="wrap">
              {customer.phone && (
                <HStack
                  spacing={2}
                  color={uiColors.textSecondary}
                  cursor="pointer"
                  _hover={{ color: uiColors.accent }}
                  onClick={() => onCopy?.(customer.phone, "Telefon")}
                >
                  <PhoneIcon width={16} />
                  <Text fontWeight="500">{customer.phone}</Text>
                </HStack>
              )}
              {customer.email && (
                <HStack
                  spacing={2}
                  color={uiColors.textSecondary}
                  cursor="pointer"
                  _hover={{ color: uiColors.accent }}
                  onClick={() => onCopy?.(customer.email, "Email")}
                >
                  <EnvelopeIcon width={16} />
                  <Text fontWeight="500">{customer.email}</Text>
                </HStack>
              )}
            </HStack>

            {/* Stats */}
            <HStack spacing={6} flexWrap="wrap">
              <Box>
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase">
                  Jami buyurtmalar
                </Text>
                <Text fontSize="xl" fontWeight="700" color={uiColors.textPrimary}>
                  {customer.totalOrders}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase">
                  Faol eSIM
                </Text>
                <Text fontSize="xl" fontWeight="700" color={uiColors.success}>
                  {customer.activeEsims}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase">
                  Jami sarflangan
                </Text>
                <Text fontSize="xl" fontWeight="700" color={uiColors.textPrimary}>
                  {formatPrice ? formatPrice(customer.totalSpentUzs) : `${customer.totalSpentUzs?.toLocaleString()} UZS`}
                </Text>
              </Box>
            </HStack>

            {/* Groups */}
            {customer.groups?.length > 0 && (
              <Box>
                <HStack spacing={2} mb={2}>
                  <UserGroupIcon width={16} color={uiColors.textSecondary} />
                  <Text fontWeight="700" color={uiColors.textPrimary}>
                    {t?.modal?.groups || "Guruhlar"}
                  </Text>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  {customer.groups.map((group) => (
                    <Badge
                      key={group.id}
                      bg={uiColors.surfaceSoft}
                      color={uiColors.textSecondary}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="500"
                    >
                      {group.name}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Order History */}
            <Box>
              <Text fontWeight="700" color={uiColors.textPrimary} mb={3}>
                {t?.modal?.orderHistory || "Buyurtmalar tarixi"}
              </Text>

              {customer.recentOrders?.length === 0 ? (
                <SurfaceCard p={4} bg={uiColors.surfaceSoft} borderRadius={uiRadii.md}>
                  <Text color={uiColors.textMuted} textAlign="center">
                    {t?.modal?.noOrders || "Buyurtmalar topilmadi"}
                  </Text>
                </SurfaceCard>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {customer.recentOrders?.map((order) => (
                    <SurfaceCard
                      key={order.id}
                      p={4}
                      borderRadius={uiRadii.md}
                      _hover={{ bg: uiColors.pageBg }}
                      cursor="pointer"
                      onClick={() => {
                        onClose();
                        navigate(`/orders/${order.id}`);
                      }}
                    >
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Text fontWeight="600" color={uiColors.textPrimary}>
                              {order.packageName}
                            </Text>
                            <OrderStatusBadge status={order.status} />
                          </HStack>
                          <Text fontSize="sm" color={uiColors.textSecondary}>
                            {order.destination} • {formatDate(order.orderedAt)}
                          </Text>
                        </VStack>

                        <VStack align="end" spacing={1}>
                          <DataUsageBar
                            usedGb={order.dataUsedGb}
                            totalGb={order.dataTotalGb}
                            size="sm"
                            variant="compact"
                          />
                          <ArrowTopRightOnSquareIcon
                            width={14}
                            color={uiColors.textMuted}
                          />
                        </VStack>
                      </HStack>
                    </SurfaceCard>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>

          {/* Footer */}
          <HStack
            px={5}
            py={4}
            borderTopWidth="1px"
            borderColor={uiColors.border}
            justify="end"
            bg={uiColors.surfaceSoft}
          >
            <AppButton variant="dark" onClick={onClose}>
              {t?.modal?.close || "Yopish"}
            </AppButton>
          </HStack>
        </SurfaceCard>
      </Box>
    </>
  );
}

export default CustomerDetailModal;
