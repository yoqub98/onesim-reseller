// Renders one customer inline form card inside the buy modal — used in CatalogOrderModal
import {
  CalendarDaysIcon,
  ClockIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { Box, Grid, HStack, IconButton, Input, Text } from "@chakra-ui/react";
import { AppSelect, SurfaceCard } from "../ui";
import {
  DELIVERY_EMAIL,
  DELIVERY_OPERATOR,
  DELIVERY_SMS
} from "../../constants/delivery";
import { uiColors } from "../../design-system/tokens";

function CustomerInlineForm({
  t,
  customer,
  index,
  canRemove,
  operatorHelperText,
  onUpdate,
  onRemove
}) {
  return (
    <SurfaceCard position="relative" p={6} borderRadius="13px" boxShadow="0px 1px 16.8px rgba(0,0,0,0.17)">
      <IconButton
        aria-label="Mijozni o'chirish"
        size="sm"
        variant="ghost"
        color="#b91c1c"
        bg="#fef2f2"
        _hover={{ bg: "#fee2e2", color: "#991b1b" }}
        position="absolute"
        top={3}
        right={3}
        isDisabled={!canRemove}
        opacity={!canRemove ? 0.45 : 1}
        cursor={!canRemove ? "not-allowed" : "pointer"}
        onClick={onRemove}
      >
        <TrashIcon width={16} />
      </IconButton>
      <HStack spacing={2} mb={3}>
        <Box w="24px" h="24px" borderRadius="full" bg="#ffeee8" display="grid" placeItems="center">
          <Text color={uiColors.accent} fontWeight="700" fontSize="xs">{index + 1}</Text>
        </Box>
        <Text color="#314158" fontWeight="500" fontSize="sm">{t.modal.customerInfo}</Text>
      </HStack>

      <HStack borderWidth="1px" borderColor="#d1d9e4" borderRadius="10px" bg="#f8fafc" px={3} h="46px" spacing={2}>
        <Box color={uiColors.textSecondary}><UserIcon width={16} /></Box>
        <Input
          h="100%"
          border="none"
          p={0}
          bg="transparent"
          _focusVisible={{ outline: "none", boxShadow: "none" }}
          placeholder={t.modal.labels.fullName}
          value={customer.fullName}
          onChange={(event) => onUpdate({ fullName: event.target.value })}
        />
      </HStack>
      {customer.errors.fullName ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.fullName}</Text> : null}

      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3} pt={4} mt={4} borderTopWidth="1px" borderColor="#f1f5f9">
        <Box>
          <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryMethod}</Text>
          <AppSelect
            h="36px"
            value={customer.deliveryMethod}
            leftIcon={customer.deliveryMethod === DELIVERY_SMS ? <PhoneIcon width={14} /> : customer.deliveryMethod === DELIVERY_EMAIL ? <EnvelopeIcon width={14} /> : <UsersIcon width={14} />}
            onChange={(event) => onUpdate({ deliveryMethod: event.target.value })}
          >
            <option value={DELIVERY_SMS}>{t.modal.methods.sms}</option>
            <option value={DELIVERY_EMAIL}>{t.modal.methods.email}</option>
            <option value={DELIVERY_OPERATOR}>{t.modal.methods.operator}</option>
          </AppSelect>
        </Box>

        {customer.deliveryMethod !== DELIVERY_OPERATOR ? (
          <Box>
            <Text fontSize="14px" fontWeight="700" color="#12161b" mb={1.5}>{t.modal.deliveryTime}</Text>
            <AppSelect
              h="36px"
              value={customer.deliveryTime}
              leftIcon={customer.deliveryTime === "scheduled" ? <CalendarDaysIcon width={14} /> : <ClockIcon width={14} />}
              onChange={(event) => onUpdate({ deliveryTime: event.target.value })}
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

      {customer.deliveryMethod !== DELIVERY_OPERATOR ? (
        <>
          <HStack mt={3} borderWidth="1px" borderColor="#d1d9e4" borderRadius="10px" bg="#f8fafc" px={3} h="40px" spacing={2}>
            <Box color={uiColors.textSecondary}>
              {customer.deliveryMethod === DELIVERY_SMS ? <PhoneIcon width={15} /> : <EnvelopeIcon width={15} />}
            </Box>
            <Input
              h="100%"
              border="none"
              p={0}
              bg="transparent"
              _focusVisible={{ outline: "none", boxShadow: "none" }}
              placeholder={customer.deliveryMethod === DELIVERY_SMS ? t.modal.labels.phone : t.modal.labels.email}
              type={customer.deliveryMethod === DELIVERY_SMS ? "tel" : "email"}
              value={customer.deliveryMethod === DELIVERY_SMS ? customer.phone : customer.email}
              onChange={(event) => {
                if (customer.deliveryMethod === DELIVERY_SMS) {
                  onUpdate({ phone: event.target.value });
                } else {
                  onUpdate({ email: event.target.value });
                }
              }}
            />
          </HStack>
          {customer.deliveryMethod === DELIVERY_SMS && customer.errors.phone ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.phone}</Text> : null}
          {customer.deliveryMethod === DELIVERY_EMAIL && customer.errors.email ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.email}</Text> : null}
        </>
      ) : null}

      {customer.deliveryMethod !== DELIVERY_OPERATOR && customer.deliveryTime === "scheduled" ? (
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3} mt={3}>
          <Box>
            <Text fontSize="13px" fontWeight="600" color="#12161b" mb={1.5}>{t.modal.labels.date}</Text>
            <Input
              type="date"
              h="38px"
              borderRadius="8px"
              borderColor="#d1d9e4"
              bg="#f8fafc"
              value={customer.scheduleDate}
              onChange={(event) => onUpdate({ scheduleDate: event.target.value })}
            />
            {customer.errors.scheduleDate ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.scheduleDate}</Text> : null}
          </Box>
          <Box>
            <Text fontSize="13px" fontWeight="600" color="#12161b" mb={1.5}>{t.modal.labels.time}</Text>
            <Input
              type="time"
              h="38px"
              borderRadius="8px"
              borderColor="#d1d9e4"
              bg="#f8fafc"
              value={customer.scheduleTime}
              onChange={(event) => onUpdate({ scheduleTime: event.target.value })}
            />
            {customer.errors.scheduleTime ? <Text mt={1} fontSize="xs" color="red.500">{customer.errors.scheduleTime}</Text> : null}
          </Box>
        </Grid>
      ) : null}
    </SurfaceCard>
  );
}

export default CustomerInlineForm;
