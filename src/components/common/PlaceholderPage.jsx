import { Box, Text, VStack } from "@chakra-ui/react";
import PageHeader from "../layout/PageHeader";
import { pageLayout } from "../../design-system/tokens";

function PlaceholderPage({ title, message }) {
  return (
    <VStack align="stretch" spacing={pageLayout.sectionGap} w="full">
      <PageHeader title={title} />
      <Box bg="white" borderRadius="xl" p={6} borderWidth="1px" borderColor="gray.200">
        <Text color="gray.600">{message}</Text>
      </Box>
    </VStack>
  );
}

export default PlaceholderPage;
