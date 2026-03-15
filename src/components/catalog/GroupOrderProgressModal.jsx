/**
 * GroupOrderProgressModal
 *
 * Shows real-time per-member progress for bulk group orders.
 * Subscribes to Supabase Realtime on:
 *   1. group_orders (to discover group_order_id and phase transitions)
 *   2. orders (to get per-member provision + delivery updates)
 *
 * Phases:
 *   initiating  — waiting for group_orders row to appear
 *   provisioning — eSIM ordering in progress (PROCESSING → ALLOCATED/FAILED per row)
 *   delivery    — SMS sending in progress (delivery_status updates)
 *   complete    — all done, show summary
 */
import { useEffect, useRef, useCallback, useReducer } from "react";
import {
  Box,
  Flex,
  HStack,
  Spinner,
  Text,
  VStack,
  useClipboard,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../lib/supabase";
import { AppButton } from "../ui";
import { uiColors } from "../../design-system/tokens";

// ── State machine ──────────────────────────────────────────

const initialState = {
  phase: "initiating",     // 'initiating' | 'provisioning' | 'delivery' | 'complete'
  groupOrderId: null,
  memberRows: {},           // orderId → { orderId, firstName, lastName, phone, orderStatus, deliveryStatus, shortUrl, iccid, error }
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_GROUP_ORDER_ID":
      return { ...state, groupOrderId: action.id, phase: "provisioning" };

    case "ORDER_EVENT": {
      const row = action.payload;
      const orderId = row.id;
      const prev = state.memberRows[orderId] || {};

      // Detect delivery phase start
      const deliveryStatus = row.delivery_status || {};
      const ds = deliveryStatus.status || "";
      const inDelivery = ["sending", "sent", "failed", "manual_pending"].includes(ds);
      const nextPhase = inDelivery && state.phase !== "complete" ? "delivery" : state.phase;

      return {
        ...state,
        phase: nextPhase,
        memberRows: {
          ...state.memberRows,
          [orderId]: {
            ...prev,
            orderId,
            firstName: row.customer_first_name || prev.firstName || "",
            lastName: row.customer_last_name || prev.lastName || "",
            phone: row.customer_phone || prev.phone || "",
            orderStatus: row.order_status || prev.orderStatus,
            deliveryStatus: deliveryStatus,
            shortUrl: row.short_url || prev.shortUrl || null,
            iccid: row.iccid || prev.iccid || null,
            error: row.delivery_status?.failure_reason || null,
          },
        },
      };
    }

    case "GROUP_ORDER_COMPLETE":
      return { ...state, phase: "complete" };

    case "SET_ERROR":
      return { ...state, error: action.error, phase: "complete" };

    default:
      return state;
  }
}

// ── Sub-components ─────────────────────────────────────────

function ProvisionIcon({ orderStatus }) {
  if (orderStatus === "PROCESSING") {
    return <Spinner size="sm" color="#f97316" />;
  }
  if (orderStatus === "ALLOCATED") {
    return <CheckCircleIcon width={20} color="#16a34a" />;
  }
  if (orderStatus === "FAILED") {
    return <XCircleIcon width={20} color="#dc2626" />;
  }
  // pending (not yet started)
  return <Box w="20px" h="20px" borderRadius="full" bg="#e2e8f0" />;
}

function DeliveryIcon({ deliveryStatus }) {
  const status = deliveryStatus?.status;
  if (status === "sending") {
    return <Spinner size="sm" color="#f97316" />;
  }
  if (status === "sent") {
    return <CheckCircleIcon width={18} color="#16a34a" />;
  }
  if (status === "failed") {
    return <XCircleIcon width={18} color="#dc2626" />;
  }
  if (status === "manual_pending") {
    return <PrinterIcon width={18} color="#94a3b8" />;
  }
  return null;
}

function ShortUrlCell({ shortUrl }) {
  const fullUrl = shortUrl ? `https://${shortUrl}` : "";
  const { hasCopied, onCopy } = useClipboard(fullUrl);

  if (!shortUrl) return <Text fontSize="xs" color={uiColors.textSecondary}>—</Text>;

  const token = shortUrl.replace("onesim.uz/e/", "");

  return (
    <Flex align="center" gap={1}>
      <Text fontSize="xs" color={uiColors.textSecondary} fontFamily="mono">
        onesim.uz/e/
      </Text>
      <Text fontSize="xs" fontWeight="700" color={uiColors.textPrimary} fontFamily="mono">
        {token}
      </Text>
      <Box
        as="button"
        onClick={onCopy}
        p={0.5}
        borderRadius="4px"
        color={hasCopied ? "#16a34a" : uiColors.textSecondary}
        _hover={{ bg: "#f1f5f9" }}
        title="Nusxa olish"
      >
        {hasCopied ? <CheckIcon width={12} /> : <ClipboardDocumentIcon width={12} />}
      </Box>
    </Flex>
  );
}

function MemberRow({ member, showDelivery }) {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ") || "—";
  const orderStatus = member.orderStatus;
  const deliveryStatus = member.deliveryStatus;
  const ds = deliveryStatus?.status;

  return (
    <Flex
      align="center"
      p={2}
      borderRadius="8px"
      bg={orderStatus === "FAILED" ? "#fef2f2" : orderStatus === "ALLOCATED" ? "#f0fdf4" : "#fafafa"}
      borderWidth="1px"
      borderColor={orderStatus === "FAILED" ? "#fecaca" : orderStatus === "ALLOCATED" ? "#bbf7d0" : "#e2e8f0"}
      gap={3}
    >
      {/* Provision status icon */}
      <Box flexShrink={0}>
        <ProvisionIcon orderStatus={orderStatus} />
      </Box>

      {/* Name */}
      <Box flex={1} minW={0}>
        <Text fontSize="sm" fontWeight="600" color={uiColors.textPrimary} noOfLines={1}>
          {fullName}
        </Text>
        {member.phone && (
          <Text fontSize="xs" color={uiColors.textSecondary}>
            {member.phone}
          </Text>
        )}
      </Box>

      {/* Short URL */}
      <Box flexShrink={0}>
        <ShortUrlCell shortUrl={member.shortUrl} />
      </Box>

      {/* Delivery status (shown after provisioning starts wrapping up) */}
      {showDelivery && orderStatus === "ALLOCATED" && (
        <Box flexShrink={0}>
          <DeliveryIcon deliveryStatus={deliveryStatus} />
          {ds === "sent" && (
            <Text fontSize="xs" color="#16a34a">Yuborildi</Text>
          )}
          {ds === "failed" && (
            <Text fontSize="xs" color="#dc2626">Xatolik</Text>
          )}
          {ds === "manual_pending" && (
            <Text fontSize="xs" color="#94a3b8">Qo'lda</Text>
          )}
          {ds === "sending" && (
            <Text fontSize="xs" color="#f97316">Yuborilmoqda</Text>
          )}
        </Box>
      )}
    </Flex>
  );
}

// ── Progress bar ───────────────────────────────────────────

function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <Box>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs" color={uiColors.textSecondary}>
          {done} / {total}
        </Text>
        <Text fontSize="xs" color={uiColors.textSecondary}>{pct}%</Text>
      </Flex>
      <Box h="6px" bg="#e2e8f0" borderRadius="full" overflow="hidden">
        <Box
          h="full"
          bg="#f97316"
          borderRadius="full"
          w={`${pct}%`}
          transition="width 0.4s ease"
        />
      </Box>
    </Box>
  );
}

// ── Summary phase ──────────────────────────────────────────

function SummaryPanel({ memberRows, onClose, onNewOrder }) {
  const rows = Object.values(memberRows);
  const esims = rows.filter((r) => r.orderStatus === "ALLOCATED").length;
  const smsSent = rows.filter((r) => r.deliveryStatus?.status === "sent").length;
  const manual = rows.filter((r) => r.deliveryStatus?.status === "manual_pending").length;
  const failed = rows.filter((r) => r.orderStatus === "FAILED").length;

  return (
    <VStack spacing={5}>
      {/* Icon */}
      <Flex direction="column" align="center" pt={2}>
        <Box
          w="64px" h="64px" borderRadius="full" bg="#dcfce7"
          display="grid" placeItems="center" mb={3}
        >
          <CheckCircleIcon width={32} color="#16a34a" />
        </Box>
        <Text fontSize="lg" fontWeight="700" color={uiColors.textPrimary}>
          Buyurtma yakunlandi!
        </Text>
      </Flex>

      {/* Stats */}
      <HStack spacing={4} justify="center" flexWrap="wrap">
        <Flex direction="column" align="center" bg="#f0fdf4" borderRadius="10px" px={4} py={3}>
          <Text fontSize="2xl" fontWeight="800" color="#16a34a">{esims}</Text>
          <Text fontSize="xs" color={uiColors.textSecondary}>ta eSIM</Text>
        </Flex>
        {smsSent > 0 && (
          <Flex direction="column" align="center" bg="#eff6ff" borderRadius="10px" px={4} py={3}>
            <Text fontSize="2xl" fontWeight="800" color="#2563eb">{smsSent}</Text>
            <Text fontSize="xs" color={uiColors.textSecondary}>ta SMS yuborildi</Text>
          </Flex>
        )}
        {manual > 0 && (
          <Flex direction="column" align="center" bg="#f8fafc" borderRadius="10px" px={4} py={3}>
            <Text fontSize="2xl" fontWeight="800" color="#64748b">{manual}</Text>
            <Text fontSize="xs" color={uiColors.textSecondary}>ta qo'lda</Text>
          </Flex>
        )}
        {failed > 0 && (
          <Flex direction="column" align="center" bg="#fef2f2" borderRadius="10px" px={4} py={3}>
            <Text fontSize="2xl" fontWeight="800" color="#dc2626">{failed}</Text>
            <Text fontSize="xs" color={uiColors.textSecondary}>ta xatolik</Text>
          </Flex>
        )}
      </HStack>

      <HStack spacing={3} w="full">
        <AppButton variant="soft" flex={1} onClick={onClose}>
          Yopish
        </AppButton>
        {onNewOrder && (
          <AppButton variant="primary" flex={1} onClick={onNewOrder}>
            Yangi buyurtma
          </AppButton>
        )}
      </HStack>
    </VStack>
  );
}

// ── Main component ─────────────────────────────────────────

export default function GroupOrderProgressModal({
  isOpen,
  groupId,          // customer_group.id — used to discover group_order_id via Realtime
  groupName,
  memberCount,      // expected number of members (for progress bar)
  onClose,
  onNewOrder,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const subscriptionsRef = useRef([]);

  // Cleanup subscriptions
  const cleanupSubs = useCallback(() => {
    subscriptionsRef.current.forEach((sub) => {
      try { sub.unsubscribe(); } catch (_) { /* no-op */ }
    });
    subscriptionsRef.current = [];
  }, []);

  // Timeout: if still in "initiating" after 20s, surface an error so the user can close
  useEffect(() => {
    if (!isOpen || state.phase !== "initiating") return;

    const timerId = setTimeout(() => {
      dispatch({
        type: "SET_ERROR",
        error: "Buyurtma boshlanmadi. Internet aloqasini tekshiring va qaytadan urinib ko'ring.",
      });
    }, 20000);

    return () => clearTimeout(timerId);
  }, [isOpen, state.phase]);

  useEffect(() => {
    if (!isOpen || !groupId) return;

    // ── Subscribe to group_orders to discover the group_order_id ──
    const groupOrderSub = supabase
      .channel(`go-discovery-${groupId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_orders",
          filter: `customer_group_id=eq.${groupId}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row?.id) return;

          dispatch({ type: "SET_GROUP_ORDER_ID", id: row.id });

          // Detect completion
          if (["completed", "partial", "failed"].includes(row.status)) {
            dispatch({ type: "GROUP_ORDER_COMPLETE" });
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(groupOrderSub);

    // ── Also query for an existing in-progress group_order (race-condition guard) ──
    supabase
      .from("group_orders")
      .select("id, status")
      .eq("customer_group_id", groupId)
      .in("status", ["api_ordering", "completed", "partial", "failed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.id) {
          dispatch({ type: "SET_GROUP_ORDER_ID", id: data.id });
          if (["completed", "partial", "failed"].includes(data.status)) {
            dispatch({ type: "GROUP_ORDER_COMPLETE" });
          }
        }
      });

    return () => {
      cleanupSubs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, groupId]);

  // ── Once we have group_order_id, subscribe to orders ──
  const { groupOrderId } = state;

  useEffect(() => {
    if (!groupOrderId) return;

    const ordersSub = supabase
      .channel(`group-order-orders-${groupOrderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `group_order_id=eq.${groupOrderId}`,
        },
        (payload) => {
          if (payload.new) {
            dispatch({ type: "ORDER_EVENT", payload: payload.new });
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(ordersSub);

    // Also load existing order rows (race-condition guard)
    supabase
      .from("orders")
      .select("id, customer_first_name, customer_last_name, customer_phone, order_status, delivery_status, short_url, iccid")
      .eq("group_order_id", groupOrderId)
      .then(({ data }) => {
        (data || []).forEach((row) => dispatch({ type: "ORDER_EVENT", payload: row }));
      });

    return () => {
      // Sub is cleaned up by the outer effect or on unmount
    };
  }, [groupOrderId]);

  // ── Cleanup on close ──
  useEffect(() => {
    if (!isOpen) {
      cleanupSubs();
    }
  }, [isOpen, cleanupSubs]);

  const memberRowsArray = Object.values(state.memberRows);
  const provisionedCount = memberRowsArray.filter(
    (r) => r.orderStatus === "ALLOCATED" || r.orderStatus === "FAILED"
  ).length;

  const showDelivery = state.phase === "delivery" || state.phase === "complete";

  const deliveredCount = memberRowsArray.filter(
    (r) => ["sent", "failed", "manual_pending"].includes(r.deliveryStatus?.status)
  ).length;
  const allocatedForDelivery = memberRowsArray.filter(
    (r) => r.orderStatus === "ALLOCATED"
  ).length;

  if (!isOpen) return null;

  return (
    <Box position="fixed" inset={0} zIndex={50} bg="rgba(15,23,43,0.5)" onClick={(state.phase === "complete" || state.phase === "initiating") ? onClose : undefined}>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={{ base: "calc(100% - 16px)", md: "560px" }}
        maxH={{ base: "calc(100vh - 32px)", md: "calc(100vh - 64px)" }}
        bg="white"
        borderRadius="16px"
        boxShadow="0px 25px 50px -12px rgba(0,0,0,0.25)"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex px={5} py={4} flexShrink={0} borderBottomWidth="1px" borderColor={uiColors.border} justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Text fontSize="md" fontWeight="700" color={uiColors.textPrimary}>
              Guruh buyurtmasi
            </Text>
            <Text fontSize="sm" color={uiColors.textSecondary}>
              {groupName}
            </Text>
          </VStack>
          {(state.phase === "complete" || state.phase === "initiating") && (
            <Box
              as="button"
              onClick={onClose}
              p={1.5}
              borderRadius="6px"
              color={uiColors.textSecondary}
              _hover={{ bg: "#f1f5f9" }}
              lineHeight={0}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </Box>
          )}
        </Flex>

        {/* Body */}
        <Box px={5} py={5} flex={1} minH={0} overflowY="auto">
          {/* Initiating */}
          {state.phase === "initiating" && (
            <VStack spacing={4} py={6}>
              <Spinner size="xl" color="#f97316" />
              <Text color={uiColors.textSecondary}>Buyurtma boshlanmoqda...</Text>
            </VStack>
          )}

          {/* Error */}
          {state.error && (
            <Box p={3} bg="#fef2f2" borderRadius="8px" mb={4}>
              <Text fontSize="sm" color="#dc2626">{state.error}</Text>
            </Box>
          )}

          {/* Complete — summary */}
          {state.phase === "complete" && (
            <SummaryPanel
              memberRows={state.memberRows}
              onClose={onClose}
              onNewOrder={onNewOrder}
            />
          )}

          {/* Provisioning / Delivery — live member list */}
          {(state.phase === "provisioning" || state.phase === "delivery") && (
            <VStack spacing={4} align="stretch">
              {!showDelivery && (
                <>
                  <Text fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>
                    eSIM buyurtma qilinmoqda...
                  </Text>
                  <ProgressBar done={provisionedCount} total={memberCount || memberRowsArray.length || 1} />
                </>
              )}
              {showDelivery && (
                <>
                  <Text fontSize="sm" fontWeight="600" color={uiColors.textPrimary}>
                    SMS yuborilmoqda...
                  </Text>
                  <ProgressBar done={deliveredCount} total={allocatedForDelivery || 1} />
                </>
              )}
              <VStack align="stretch" spacing={2}>
                {memberRowsArray.length === 0 && (
                  <Flex justify="center" py={4}>
                    <Spinner size="sm" color="#f97316" />
                  </Flex>
                )}
                {memberRowsArray.map((member) => (
                  <MemberRow
                    key={member.orderId}
                    member={member}
                    showDelivery={showDelivery}
                  />
                ))}
              </VStack>
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
