// Self Order Form for Mode 1 (Tur agent nomiga) - order for partner themselves
import { useState, useCallback } from "react";
import {
  Box,
  Flex,
  Grid,
  HStack,
  Spinner,
  Text,
  VStack,
  useClipboard
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  ClipboardIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { AppButton, AppInput, SurfaceCard } from "../ui";
import { DELIVERY_MANUAL, DELIVERY_SMS } from "../../constants/delivery";
import { uiColors, uiShadows } from "../../design-system/tokens";
import { ordersService } from "../../services/ordersService";
import { QRCodeSVG } from "qrcode.react";

/**
 * SelfOrderForm - Form for Mode 1 (Tur agent nomiga)
 * Handles quantity, delivery method, phone input, and processes order via Edge Function
 */
function SelfOrderForm({
  t,
  partner,
  buyPlan,
  onOrderComplete,
  onClose
}) {
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState(DELIVERY_SMS);
  const [phone, setPhone] = useState(partner?.business_phone || "");
  const [phoneError, setPhoneError] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [orderError, setOrderError] = useState(null);

  // When quantity > 1, force manual delivery
  const effectiveDeliveryMethod = quantity > 1 ? DELIVERY_MANUAL : deliveryMethod;

  // Validate phone for SMS delivery
  const validatePhone = useCallback(() => {
    if (effectiveDeliveryMethod !== DELIVERY_SMS) return true;
    if (!ordersService.isValidUzPhone(phone)) {
      setPhoneError(t.modal?.error?.invalidPhone || "Telefon raqam noto'g'ri");
      return false;
    }
    setPhoneError("");
    return true;
  }, [phone, effectiveDeliveryMethod, t.modal?.error?.invalidPhone]);

  // Handle order submission
  const handleSubmit = async () => {
    if (!validatePhone()) return;

    setIsProcessing(true);
    setOrderError(null);

    try {
      const result = await ordersService.createSingleOrder({
        packageCode: buyPlan.packageCode,
        quantity,
        deliveryMethod: effectiveDeliveryMethod === DELIVERY_SMS ? "sms" : "manual",
        phone: effectiveDeliveryMethod === DELIVERY_SMS ? ordersService.formatPhoneNumber(phone) : null
      });

      if (result.success) {
        setOrderResult(result);
        if (onOrderComplete) {
          onOrderComplete(result);
        }
      } else {
        setOrderError(result.error || "Buyurtma qayta ishlashda xatolik");
      }
    } catch (err) {
      console.error("Order error:", err);
      setOrderError(err.message || "Kutilmagan xatolik yuz berdi");
    } finally {
      setIsProcessing(false);
    }
  };

  // Result phase - show QR codes and links after successful order
  if (orderResult) {
    return (
      <SelfOrderResult
        t={t}
        result={orderResult}
        onClose={onClose}
        onNewOrder={() => {
          setOrderResult(null);
          setQuantity(1);
        }}
      />
    );
  }

  // Form phase
  return (
    <VStack align="stretch" spacing={5}>
      {/* Quantity input */}
      <Box>
        <AppInput
          label={t.modal?.selfOrder?.quantityLabel || "Nechta eSIM?"}
          type="number"
          min={1}
          max={30}
          value={quantity}
          onChange={(e) => {
            const val = Math.min(30, Math.max(1, parseInt(e.target.value) || 1));
            setQuantity(val);
          }}
          helperText={t.modal?.selfOrder?.quantityHint || "1 dan 30 gacha"}
        />
      </Box>

      {/* Delivery method (only when qty = 1) */}
      {quantity === 1 && (
        <Box>
          <Text fontSize="14px" fontWeight="600" color={uiColors.textPrimary} mb={2}>
            {t.modal?.selfOrder?.deliveryLabel || "Yetkazib berish usuli"}
          </Text>
          <Grid templateColumns="1fr 1fr" gap={3}>
            <SurfaceCard
              p={3}
              cursor="pointer"
              borderWidth="2px"
              borderColor={deliveryMethod === DELIVERY_SMS ? uiColors.accent : uiColors.border}
              bg={deliveryMethod === DELIVERY_SMS ? "rgba(254,79,24,0.05)" : "white"}
              onClick={() => setDeliveryMethod(DELIVERY_SMS)}
              boxShadow={deliveryMethod === DELIVERY_SMS ? uiShadows.soft : "none"}
            >
              <HStack spacing={2}>
                <PhoneIcon width={18} color={deliveryMethod === DELIVERY_SMS ? uiColors.accent : uiColors.textSecondary} />
                <Text fontSize="sm" fontWeight="600" color={deliveryMethod === DELIVERY_SMS ? uiColors.accent : uiColors.textPrimary}>
                  SMS
                </Text>
              </HStack>
              <Text fontSize="xs" color={uiColors.textSecondary} mt={1}>
                {t.modal?.selfOrder?.smsDeliveryNote || "SMS orqali yuboriladi"}
              </Text>
            </SurfaceCard>
            <SurfaceCard
              p={3}
              cursor="pointer"
              borderWidth="2px"
              borderColor={deliveryMethod === DELIVERY_MANUAL ? uiColors.accent : uiColors.border}
              bg={deliveryMethod === DELIVERY_MANUAL ? "rgba(254,79,24,0.05)" : "white"}
              onClick={() => setDeliveryMethod(DELIVERY_MANUAL)}
              boxShadow={deliveryMethod === DELIVERY_MANUAL ? uiShadows.soft : "none"}
            >
              <HStack spacing={2}>
                <DevicePhoneMobileIcon width={18} color={deliveryMethod === DELIVERY_MANUAL ? uiColors.accent : uiColors.textSecondary} />
                <Text fontSize="sm" fontWeight="600" color={deliveryMethod === DELIVERY_MANUAL ? uiColors.accent : uiColors.textPrimary}>
                  Qo'lda
                </Text>
              </HStack>
              <Text fontSize="xs" color={uiColors.textSecondary} mt={1}>
                {t.modal?.selfOrder?.manualDeliveryNote || "Linklar beriladi"}
              </Text>
            </SurfaceCard>
          </Grid>
        </Box>
      )}

      {/* Phone input (only for SMS delivery with qty = 1) */}
      {quantity === 1 && deliveryMethod === DELIVERY_SMS && (
        <Box>
          <AppInput
            label={t.modal?.selfOrder?.phoneLabel || "eSIM qayerga yuborilsin?"}
            placeholder={t.modal?.selfOrder?.phonePlaceholder || "998 XX XXX XX XX"}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError("");
            }}
            error={phoneError}
            leftElement={<PhoneIcon width={16} />}
          />
        </Box>
      )}

      {/* Manual delivery note for qty > 1 */}
      {quantity > 1 && (
        <SurfaceCard p={3} bg="#fef3c7" borderColor="#fcd34d" borderWidth="1px">
          <HStack spacing={2}>
            <ExclamationTriangleIcon width={18} color="#d97706" />
            <Text fontSize="sm" color="#92400e">
              {quantity} ta eSIM uchun SMS yuborilmaydi. Linklar nusxalash uchun beriladi.
            </Text>
          </HStack>
        </SurfaceCard>
      )}

      {/* Error message */}
      {orderError && (
        <SurfaceCard p={3} bg="#fef2f2" borderColor="#fca5a5" borderWidth="1px">
          <HStack spacing={2}>
            <ExclamationTriangleIcon width={18} color="#dc2626" />
            <Text fontSize="sm" color="#991b1b">{orderError}</Text>
          </HStack>
        </SurfaceCard>
      )}

      {/* Submit button */}
      <AppButton
        variant="primary"
        h="48px"
        onClick={handleSubmit}
        isDisabled={isProcessing}
      >
        {isProcessing ? (
          <HStack spacing={2}>
            <Spinner size="sm" />
            <Text>{t.modal?.processing || "Buyurtma qayta ishlanmoqda..."}</Text>
          </HStack>
        ) : (
          t.modal?.confirm || "Tasdiqlash"
        )}
      </AppButton>
    </VStack>
  );
}

/**
 * SelfOrderResult - Shows QR codes and links after successful order
 */
function SelfOrderResult({ t, result, onClose, onNewOrder }) {
  const orders = result.orders || [];
  const firstOrder = orders[0];
  const { hasCopied, onCopy } = useClipboard(firstOrder?.short_url || "");

  if (orders.length === 0) {
    return (
      <VStack spacing={4} py={6}>
        <ExclamationTriangleIcon width={48} color="#dc2626" />
        <Text color={uiColors.textPrimary}>{t.modal?.error?.title || "Xatolik yuz berdi"}</Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={5}>
      {/* Success header */}
      <Flex align="center" justify="center" direction="column" py={4}>
        <Box
          w="64px"
          h="64px"
          borderRadius="full"
          bg="#dcfce7"
          display="grid"
          placeItems="center"
          mb={3}
        >
          <CheckCircleIcon width={32} color="#16a34a" />
        </Box>
        <Text fontSize="lg" fontWeight="700" color={uiColors.textPrimary} textAlign="center">
          {orders.length === 1
            ? (t.modal?.result?.title || "eSIM muvaffaqiyatli buyurtma qilindi!")
            : (t.modal?.result?.titleMultiple || "{count} ta eSIM buyurtma qilindi!").replace("{count}", orders.length)
          }
        </Text>
        {result.sms_sent && (
          <Text fontSize="sm" color="#16a34a" mt={2}>
            {(t.modal?.result?.smsSent || "eSIM {phone} raqamiga SMS orqali yuborildi").replace("{phone}", "****")}
          </Text>
        )}
      </Flex>

      {/* Single order - show QR code prominently */}
      {orders.length === 1 && firstOrder && (
        <SurfaceCard p={4} boxShadow={uiShadows.soft}>
          <VStack spacing={4}>
            {/* QR Code */}
            <Box
              p={3}
              bg="white"
              borderRadius="12px"
              borderWidth="1px"
              borderColor={uiColors.border}
            >
              <QRCodeSVG
                value={firstOrder.activation_code || firstOrder.qr_code_data}
                size={160}
                level="M"
              />
            </Box>

            {/* ICCID */}
            <Text fontSize="xs" color={uiColors.textSecondary}>
              ICCID: ...{firstOrder.iccid?.slice(-4)}
            </Text>

            {/* Token URL with copy */}
            <Box w="full">
              <Text fontSize="sm" fontWeight="600" color={uiColors.textPrimary} mb={2}>
                {t.modal?.result?.linkLabel || "O'rnatish havolasi"}
              </Text>
              <Flex
                bg="#f8fafc"
                borderWidth="1px"
                borderColor={uiColors.border}
                borderRadius="8px"
                p={2}
                align="center"
                justify="space-between"
              >
                <HStack spacing={0}>
                  <Text fontSize="sm" color={uiColors.textSecondary} fontFamily="mono">
                    onesim.uz/e/
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color={uiColors.textPrimary} fontFamily="mono">
                    {(firstOrder.short_url || "").replace("onesim.uz/e/", "")}
                  </Text>
                </HStack>
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={onCopy}
                  leftIcon={hasCopied ? <CheckIcon width={14} /> : <ClipboardIcon width={14} />}
                  color={hasCopied ? "#16a34a" : uiColors.textSecondary}
                >
                  {hasCopied ? (t.modal?.result?.copied || "Nusxa olindi!") : (t.modal?.result?.copyLink || "Nusxa olish")}
                </AppButton>
              </Flex>
            </Box>
          </VStack>
        </SurfaceCard>
      )}

      {/* Multiple orders - show list */}
      {orders.length > 1 && (
        <VStack align="stretch" spacing={3} maxH="300px" overflowY="auto">
          {orders.map((order, index) => (
            <OrderResultRow key={order.id} order={order} index={index} t={t} />
          ))}
        </VStack>
      )}

      {/* Action buttons */}
      <HStack spacing={3} pt={2}>
        <AppButton variant="soft" flex={1} onClick={onClose}>
          {t.modal?.result?.close || "Yopish"}
        </AppButton>
        <AppButton variant="primary" flex={1} onClick={onNewOrder}>
          {t.modal?.result?.newOrder || "Yangi buyurtma"}
        </AppButton>
      </HStack>
    </VStack>
  );
}

/**
 * OrderResultRow - Single row for multiple order results
 */
function OrderResultRow({ order, index, t }) {
  const { hasCopied, onCopy } = useClipboard(order.short_url);

  return (
    <SurfaceCard p={3} boxShadow={uiShadows.soft}>
      <Flex justify="space-between" align="center">
        <HStack spacing={3}>
          <Box
            w="32px"
            h="32px"
            borderRadius="8px"
            bg="#f1f5f9"
            display="grid"
            placeItems="center"
          >
            <Text fontSize="sm" fontWeight="600" color={uiColors.textSecondary}>
              {index + 1}
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>
              ICCID: ...{order.iccid?.slice(-4)}
            </Text>
            <Text fontSize="xs" color={uiColors.textSecondary} fontFamily="mono">
              {order.short_url}
            </Text>
          </Box>
        </HStack>
        <AppButton
          variant="ghost"
          size="sm"
          onClick={onCopy}
          leftIcon={hasCopied ? <CheckIcon width={14} /> : <ClipboardIcon width={14} />}
          color={hasCopied ? "#16a34a" : uiColors.textSecondary}
        >
          {hasCopied ? (t.modal?.result?.copied || "Nusxa olindi!") : (t.modal?.result?.copyLink || "Nusxa")}
        </AppButton>
      </Flex>
    </SurfaceCard>
  );
}

export default SelfOrderForm;
