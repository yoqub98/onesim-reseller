import { XMarkIcon } from "@heroicons/react/24/outline";
import { Box, HStack, Text, Textarea, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { uiColors } from "../../design-system/tokens";
import { AppButton, AppIconButton, AppInput, SurfaceCard } from "../ui";

function toMembersText(members = []) {
  return members.map((member) => [member.name, member.phone, member.email].filter(Boolean).join(", ")).join("\n");
}

function parseMembers(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", phone = "", email = ""] = line.split(",").map((chunk) => chunk.trim());
      return { name, phone, email };
    })
    .filter((member) => member.name);
}

function GroupFormModal({ isOpen, mode, group, t, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationCountryCode, setDestinationCountryCode] = useState("");
  const [travelStartDate, setTravelStartDate] = useState("");
  const [travelEndDate, setTravelEndDate] = useState("");
  const [membersText, setMembersText] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(group?.name || "");
    setDestination(group?.destination || "");
    setDestinationCountryCode(group?.destinationCountryCode || "");
    setTravelStartDate(group?.travelStartDate || "");
    setTravelEndDate(group?.travelEndDate || "");
    setMembersText(toMembersText(group?.members || []));
  }, [group, isOpen]);

  const modalTitle = useMemo(
    () => (mode === "edit" ? t.form.editTitle : t.form.createTitle),
    [mode, t.form.createTitle, t.form.editTitle]
  );

  if (!isOpen) return null;

  return (
    <>
      <Box position="fixed" inset={0} bg="rgba(15, 23, 43, 0.48)" backdropFilter="blur(2px)" zIndex={40} onClick={onClose} />
      <Box position="fixed" inset={0} zIndex={50} display="grid" placeItems="center" p={4}>
        <SurfaceCard w="full" maxW="700px" borderRadius="14px" overflow="hidden">
          <HStack px={5} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <Box>
              <Text fontWeight="800" fontSize="xl" color={uiColors.textPrimary}>{modalTitle}</Text>
              <Text fontSize="sm" color={uiColors.textSecondary}>{t.form.helper}</Text>
            </Box>
            <AppIconButton variant="ghost" aria-label={t.actions.close} icon={<XMarkIcon width={18} />} onClick={onClose} />
          </HStack>

          <VStack align="stretch" spacing={4} p={5} maxH="70vh" overflowY="auto">
            <AppInput
              label={t.form.name}
              placeholder={t.form.namePlaceholder}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <HStack align="start" spacing={3}>
              <AppInput
                label={t.form.destination}
                placeholder={t.form.destinationPlaceholder}
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                containerProps={{ flex: 1 }}
              />
              <AppInput
                label={t.form.countryCode}
                placeholder="AE"
                textTransform="uppercase"
                value={destinationCountryCode}
                onChange={(event) => setDestinationCountryCode(event.target.value.toUpperCase())}
                containerProps={{ maxW: "120px" }}
              />
            </HStack>

            <HStack align="start" spacing={3}>
              <AppInput
                label={t.form.departure}
                type="date"
                value={travelStartDate}
                onChange={(event) => setTravelStartDate(event.target.value)}
                containerProps={{ flex: 1 }}
              />
              <AppInput
                label={t.form.return}
                type="date"
                value={travelEndDate}
                onChange={(event) => setTravelEndDate(event.target.value)}
                containerProps={{ flex: 1 }}
              />
            </HStack>

            <Box>
              <Text fontSize="14px" fontWeight="500" color={uiColors.textPrimary} mb="8px">{t.form.members}</Text>
              <Textarea
                minH="120px"
                borderRadius="8px"
                borderColor={uiColors.border}
                _focus={{ borderColor: uiColors.accent, boxShadow: `0 0 0 1px ${uiColors.accent}` }}
                placeholder={t.form.membersPlaceholder}
                value={membersText}
                onChange={(event) => setMembersText(event.target.value)}
              />
              <Text mt={1.5} fontSize="xs" color={uiColors.textMuted}>{t.form.membersHelper}</Text>
            </Box>
          </VStack>

          <HStack px={5} py={4} borderTopWidth="1px" borderColor={uiColors.border} justify="end" bg={uiColors.surfaceSoft}>
            <AppButton onClick={onClose}>{t.actions.cancel}</AppButton>
            <AppButton
              variant="primary"
              onClick={() => {
                onSubmit({
                  id: group?.id,
                  name,
                  destination,
                  destinationCountryCode,
                  travelStartDate,
                  travelEndDate,
                  members: parseMembers(membersText)
                });
              }}
            >
              {mode === "edit" ? t.actions.save : t.actions.create}
            </AppButton>
          </HStack>
        </SurfaceCard>
      </Box>
    </>
  );
}

export default GroupFormModal;
