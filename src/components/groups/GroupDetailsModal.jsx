import { PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";
import { AppButton, AppIconButton, SurfaceCard } from "../ui";

function GroupDetailsModal({ group, t, onClose }) {
  if (!group) return null;

  return (
    <>
      <Box position="fixed" inset={0} bg="rgba(15, 23, 43, 0.48)" backdropFilter="blur(2px)" zIndex={40} onClick={onClose} />
      <Box position="fixed" inset={0} zIndex={50} display="grid" placeItems="center" p={4}>
        <SurfaceCard w="full" maxW="820px" borderRadius="14px" overflow="hidden">
          <HStack px={5} py={4} justify="space-between" borderBottomWidth="1px" borderColor={uiColors.border}>
            <Box>
              <Text fontWeight="800" fontSize="xl" color={uiColors.textPrimary}>{group.name}</Text>
              <Text fontSize="sm" color={uiColors.textSecondary}>ID: {group.code || group.id.slice(0, 8)}</Text>
            </Box>
            <AppIconButton variant="ghost" aria-label={t.actions.close} icon={<XMarkIcon width={18} />} onClick={onClose} />
          </HStack>

          <VStack align="stretch" spacing={4} p={5} maxH="70vh" overflowY="auto">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
              <SurfaceCard p={3} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase">{t.labels.destination}</Text>
                <Text mt={1.5} fontWeight="700">{group.destination || "--"}</Text>
              </SurfaceCard>
              <SurfaceCard p={3} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase">{t.labels.departure}</Text>
                <Text mt={1.5} fontWeight="700">{group.travelStartDate || "--"}</Text>
              </SurfaceCard>
              <SurfaceCard p={3} borderRadius="10px">
                <Text fontSize="xs" color={uiColors.textMuted} textTransform="uppercase">{t.labels.return}</Text>
                <Text mt={1.5} fontWeight="700">{group.travelEndDate || "--"}</Text>
              </SurfaceCard>
            </SimpleGrid>

            <Box>
              <Text fontWeight="700" color={uiColors.textPrimary}>{t.labels.membersList}</Text>
              <Text fontSize="sm" color={uiColors.textSecondary} mb={3}>{group.members?.length || 0} {t.labels.members}</Text>

              <SurfaceCard borderRadius="12px" overflow="hidden">
                <VStack align="stretch" spacing={0}>
                  {(group.members || []).map((member, index) => (
                    <HStack key={`${group.id}-${member.name}-${index}`} px={4} py={3.5} justify="space-between" align="start">
                      <Box>
                        <Text color={uiColors.textPrimary} fontWeight="600">{member.name}</Text>
                        <Text color={uiColors.textSecondary} fontSize="sm">{member.email || "--"}</Text>
                      </Box>
                      <HStack spacing={1.5} color={uiColors.textSecondary}>
                        <PhoneIcon width={14} />
                        <Text fontSize="sm">{member.phone || "--"}</Text>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </SurfaceCard>
            </Box>
          </VStack>

          <HStack px={5} py={4} borderTopWidth="1px" borderColor={uiColors.border} justify="end" bg={uiColors.surfaceSoft}>
            <AppButton variant="dark" onClick={onClose}>{t.actions.close}</AppButton>
          </HStack>
        </SurfaceCard>
      </Box>
    </>
  );
}

export default GroupDetailsModal;
