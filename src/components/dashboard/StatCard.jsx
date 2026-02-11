import { Box, HStack, Text, VStack } from "@chakra-ui/react";

function StatCard({ label, value, helper, icon }) {
  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="white" p={5}>
      <HStack align="start" justify="space-between">
        <VStack align="start" spacing={1}>
          <Text color="gray.500" fontSize="sm">{label}</Text>
          <Text fontWeight="bold" fontSize="2xl">{value}</Text>
          {helper ? <Text color="gray.500" fontSize="xs">{helper}</Text> : null}
        </VStack>
        {icon}
      </HStack>
    </Box>
  );
}

export default StatCard;
