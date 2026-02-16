// Renders fixed action buttons for resend/suspend/cancel/topup — used in OrderDetailsPage
import { EnvelopeIcon, PauseCircleIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Box, HStack } from "@chakra-ui/react";
import { AppButton } from "../ui";
import { uiColors } from "../../design-system/tokens";

function OrderActionButtonsBar({ detail, isActionBusy, onResend, onPause, onCancel, onTopup }) {
  return (
    <Box
      position="fixed"
      bottom={0}
      left={{ base: 0, lg: "256px" }}
      right={0}
      bg="white"
      borderTopWidth="1px"
      borderColor={uiColors.border}
      px={{ base: 4, lg: 8 }}
      py={4}
      zIndex={30}
      boxShadow="0px -4px 6px rgba(0,0,0,0.05)"
    >
      <HStack justify="flex-end" flexWrap="wrap" gap={2}>
        <AppButton
          variant="outline"
          h="40px"
          px={4}
          borderColor={uiColors.border}
          startElement={<EnvelopeIcon width={16} />}
          onClick={onResend}
          isDisabled={isActionBusy}
        >
          {detail.actions.resend}
        </AppButton>
        <AppButton
          variant="outline"
          h="40px"
          px={4}
          borderColor="#ffd6a8"
          color="#f54900"
          startElement={<PauseCircleIcon width={16} />}
          onClick={onPause}
          isDisabled={isActionBusy}
        >
          {detail.actions.pause}
        </AppButton>
        <AppButton
          variant="outline"
          h="40px"
          px={4}
          borderColor="#ffc9c9"
          color="#e7000b"
          startElement={<TrashIcon width={16} />}
          onClick={onCancel}
          isDisabled={isActionBusy}
        >
          {detail.actions.cancel}
        </AppButton>
        <AppButton
          variant="dark"
          h="40px"
          px={4}
          startElement={<PlusCircleIcon width={16} />}
          onClick={onTopup}
          isDisabled={isActionBusy}
        >
          {detail.actions.topup} ({detail.actions.addPackage})
        </AppButton>
      </HStack>
    </Box>
  );
}

export default OrderActionButtonsBar;
