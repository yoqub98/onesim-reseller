import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { pageLayout, uiColors } from "../../design-system/tokens";

/**
 * PageHeader — consistent page title block used across all portal pages.
 *
 * Props:
 *   title    — page heading text (required)
 *   subtitle — secondary description (optional)
 *   children — right-side actions like buttons (optional)
 */
function PageHeader({ title, subtitle, children }) {
  // When there are action buttons, use Flex row; otherwise just a Box.
  if (children) {
    return (
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} flexWrap="wrap">
        <Box>
          <Heading
            color={uiColors.textPrimary}
            fontSize={pageLayout.heading.fontSize}
            fontWeight={pageLayout.heading.fontWeight}
            lineHeight={pageLayout.heading.lineHeight}
          >
            {title}
          </Heading>
          {subtitle ? (
            <Text color={uiColors.textSecondary} mt={pageLayout.subtitleMt}>{subtitle}</Text>
          ) : null}
        </Box>
        {children}
      </Flex>
    );
  }

  return (
    <Box>
      <Heading
        color={uiColors.textPrimary}
        fontSize={pageLayout.heading.fontSize}
        fontWeight={pageLayout.heading.fontWeight}
        lineHeight={pageLayout.heading.lineHeight}
      >
        {title}
      </Heading>
      {subtitle ? (
        <Text color={uiColors.textSecondary} mt={pageLayout.subtitleMt}>{subtitle}</Text>
      ) : null}
    </Box>
  );
}

export default PageHeader;
