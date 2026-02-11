import { Box, Heading, Text } from "@chakra-ui/react";

function PlaceholderPage({ title, message }) {
  return (
    <Box bg="white" borderRadius="xl" p={6} borderWidth="1px" borderColor="gray.200">
      <Heading size="md" mb={2}>{title}</Heading>
      <Text color="gray.600">{message}</Text>
    </Box>
  );
}

export default PlaceholderPage;
