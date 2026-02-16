// Renders order detail modals for self and group tabs — used in OrdersPage
import {
  ClipboardDocumentIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PrinterIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Badge, Box, Grid, Heading, HStack, Table, Text, VStack } from "@chakra-ui/react";
import { AppButton, AppIconButton, SurfaceCard } from "../ui";
import { DELIVERY_EMAIL, DELIVERY_MANUAL, DELIVERY_SMS } from "../../constants/delivery";
import { uiColors } from "../../design-system/tokens";
import { formatMoneyFromUzs } from "../../utils/currency";
import StatusPill from "./StatusPill";

function formatUsage(used, total) {
  if (total === 999) {
    return `${Number(used || 0).toFixed(1)} / INFINITY GB`;
  }

  return `${Number(used || 0).toFixed(1)} / ${Number(total || 0)} GB`;
}

function modalBackdrop(onClose) {
  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(15, 23, 43, 0.48)"
      backdropFilter="blur(2px)"
      zIndex={40}
      onClick={onClose}
    />
  );
}

function SelfOrderModal({ order, t, statusLabels, onClose, onCopy }) {
  if (!order) {
    return null;
  }

  const qrData = `LPA:1$esim.onesim.uz$${order.iccid}`;

  return (
    <>
      {modalBackdrop(onClose)}
      <Box position="fixed" inset={0} zIndex={50} display="grid" placeItems="center" p={4}>
        <SurfaceCard w="full" maxW="520px" overflow="hidden" borderRadius="14px">
          <HStack px={5} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <Heading fontSize="lg" color={uiColors.textPrimary}>{t.title}</Heading>
            <AppIconButton
              aria-label={t.close}
              icon={<XMarkIcon width={18} />}
              variant="ghost"
              onClick={onClose}
            />
          </HStack>
          <VStack spacing={5} align="stretch" p={5}>
            <VStack spacing={3}>
              <Box p={3} borderWidth="1px" borderColor={uiColors.border} borderRadius="14px" bg="white">
                <Box
                  as="img"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`}
                  alt={t.qrAlt}
                  w="160px"
                  h="160px"
                />
              </Box>
              <Text fontSize="sm" color={uiColors.textSecondary} textAlign="center">
                {t.helper}
              </Text>
            </VStack>

            <SurfaceCard p={3} borderRadius="10px">
              <HStack justify="space-between" align="start">
                <Box>
                  <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                    {t.iccid}
                  </Text>
                  <Text mt={1} fontFamily="mono" color={uiColors.textPrimary}>{order.iccid}</Text>
                </Box>
                <AppIconButton
                  aria-label={t.copy}
                  icon={<ClipboardDocumentIcon width={16} />}
                  onClick={() => onCopy(order.iccid, t.iccid)}
                />
              </HStack>
            </SurfaceCard>

            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
              <SurfaceCard p={3} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                  {t.status}
                </Text>
                <Box mt={2}>
                  <StatusPill value={order.status} labels={statusLabels} />
                </Box>
              </SurfaceCard>
              <SurfaceCard p={3} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                  {t.traffic}
                </Text>
                <Text mt={2} color={uiColors.textPrimary} fontWeight="600">
                  {formatUsage(order.dataUsageGb, order.totalDataGb)}
                </Text>
              </SurfaceCard>
            </Grid>
          </VStack>
          <Box px={5} py={4} borderTopWidth="1px" borderColor={uiColors.border} bg={uiColors.surfaceSoft}>
            <AppButton variant="dark" w="full" onClick={onClose}>
              {t.close}
            </AppButton>
          </Box>
        </SurfaceCard>
      </Box>
    </>
  );
}

function GroupOrderModal({ order, t, statusLabels, currency, onClose }) {
  if (!order) {
    return null;
  }

  const members = order.groupMembers || [];

  return (
    <>
      {modalBackdrop(onClose)}
      <Box position="fixed" inset={0} zIndex={50} display="grid" placeItems="center" p={4}>
        <SurfaceCard w="full" maxW="1040px" maxH="88vh" overflow="hidden" borderRadius="14px">
          <HStack px={6} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <Box>
              <HStack spacing={2} mb={1}>
                <Heading fontSize="xl" color={uiColors.textPrimary}>{order.groupName}</Heading>
                <StatusPill value={order.status} labels={statusLabels} />
              </HStack>
              <Text fontSize="sm" color={uiColors.textSecondary}>{t.orderId}: {order.id}</Text>
            </Box>
            <AppIconButton
              aria-label={t.close}
              icon={<XMarkIcon width={18} />}
              variant="ghost"
              onClick={onClose}
            />
          </HStack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="1px" bg={uiColors.border}>
            <SurfaceCard borderRadius="none" boxShadow="none" borderWidth="0" p={4}>
              <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                {t.stats.totalCustomers}
              </Text>
              <Text mt={1} fontWeight="800" fontSize="2xl" color={uiColors.textPrimary}>
                {members.length}
              </Text>
            </SurfaceCard>
            <SurfaceCard borderRadius="none" boxShadow="none" borderWidth="0" p={4}>
              <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                {t.stats.packagePrice}
              </Text>
              <Text mt={1} fontWeight="800" fontSize="2xl" color={uiColors.textPrimary}>
                {formatMoneyFromUzs(order.package?.priceUzs || 0, currency)}
              </Text>
            </SurfaceCard>
            <SurfaceCard borderRadius="none" boxShadow="none" borderWidth="0" p={4}>
              <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase" fontWeight="700">
                {t.stats.totalPaid}
              </Text>
              <Text mt={1} fontWeight="800" fontSize="2xl" color="#b91c1c">
                {formatMoneyFromUzs(order.paymentTotalUzs || 0, currency)}
              </Text>
            </SurfaceCard>
          </Grid>

          <Box p={5} bg={uiColors.surfaceSoft} maxH="52vh" overflowY="auto">
            <SurfaceCard overflow="hidden" borderRadius="14px">
              <Table.Root size="sm">
                <Table.Header bg={uiColors.surfaceSoft}>
                  <Table.Row>
                    <Table.ColumnHeader>{t.table.memberName}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.table.contact}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.table.delivery}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.table.deliveryStatus}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.table.esimStatus}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">{t.table.traffic}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {members.map((member) => (
                    <Table.Row key={member.id}>
                      <Table.Cell fontWeight="600">{member.name}</Table.Cell>
                      <Table.Cell color={uiColors.textSecondary}>{member.phone || member.email || "-"}</Table.Cell>
                      <Table.Cell>
                        <HStack spacing={1.5} color={uiColors.textSecondary}>
                          {member.deliveryMethod === DELIVERY_SMS ? <DevicePhoneMobileIcon width={15} /> : null}
                          {member.deliveryMethod === DELIVERY_EMAIL ? <EnvelopeIcon width={15} /> : null}
                          {member.deliveryMethod === DELIVERY_MANUAL ? <PrinterIcon width={15} /> : null}
                          <Text fontSize="sm">{t.deliveryMethods[member.deliveryMethod] || member.deliveryMethod}</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          bg={member.deliveryStatus === "sent" ? "#dcfce7" : "#fff0e8"}
                          color={member.deliveryStatus === "sent" ? "#166534" : "#a65f00"}
                          borderWidth="1px"
                          borderColor={member.deliveryStatus === "sent" ? "#bbf7d0" : "#ffb085"}
                          textTransform="none"
                        >
                          {t.deliveryStatus[member.deliveryStatus] || member.deliveryStatus}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell><StatusPill value={member.status} labels={statusLabels} /></Table.Cell>
                      <Table.Cell textAlign="right" fontFamily="mono" color={uiColors.textSecondary}>
                        {formatUsage(member.dataUsageGb, member.totalDataGb)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </SurfaceCard>
          </Box>

          <HStack px={5} py={4} borderTopWidth="1px" borderColor={uiColors.border} justify="end">
            <AppButton variant="dark" onClick={onClose}>
              {t.close}
            </AppButton>
          </HStack>
        </SurfaceCard>
      </Box>
    </>
  );
}

function OrderActionModals({
  selfOrder,
  groupOrder,
  tSelf,
  tGroup,
  statusLabels,
  currency,
  onCloseSelf,
  onCloseGroup,
  onCopy
}) {
  return (
    <>
      <SelfOrderModal
        order={selfOrder}
        t={tSelf}
        statusLabels={statusLabels}
        onClose={onCloseSelf}
        onCopy={onCopy}
      />
      <GroupOrderModal
        order={groupOrder}
        t={tGroup}
        statusLabels={statusLabels}
        currency={currency}
        onClose={onCloseGroup}
      />
    </>
  );
}

export default OrderActionModals;
