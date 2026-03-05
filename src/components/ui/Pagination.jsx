import { HStack, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { AppButton } from "./AppButton";
import { uiColors, uiRadii } from "../../design-system/tokens";

const SIBLING_COUNT = 1;

function buildPageRange(currentPage, totalPages) {
  const pages = [];
  const left = Math.max(2, currentPage - SIBLING_COUNT);
  const right = Math.min(totalPages - 1, currentPage + SIBLING_COUNT);

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i += 1) pages.push(i);
  if (right < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemLabel
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);
  const showRange = totalItems != null && pageSize != null;
  const rangeStart = showRange ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = showRange ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <HStack justify="space-between" align="center" w="full" flexWrap="wrap" gap={3}>
      {showRange ? (
        <Text fontSize="sm" color={uiColors.textSecondary}>
          {rangeStart}-{rangeEnd} / {totalItems} {itemLabel || ""}
        </Text>
      ) : (
        <Text />
      )}

      <HStack spacing={1}>
        <AppButton
          variant="ghost"
          size="xs"
          h="32px"
          minW="32px"
          px={0}
          borderRadius={uiRadii.sm}
          isDisabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon width={16} />
        </AppButton>

        {pages.map((page, idx) =>
          page === "..." ? (
            <Text key={`ellipsis-${idx}`} fontSize="sm" color={uiColors.textMuted} px={1} userSelect="none">
              ...
            </Text>
          ) : (
            <AppButton
              key={page}
              variant={page === currentPage ? "primary" : "ghost"}
              size="xs"
              h="32px"
              minW="32px"
              px={0}
              borderRadius={uiRadii.sm}
              fontSize="sm"
              fontWeight={page === currentPage ? "700" : "500"}
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </AppButton>
          )
        )}

        <AppButton
          variant="ghost"
          size="xs"
          h="32px"
          minW="32px"
          px={0}
          borderRadius={uiRadii.sm}
          isDisabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRightIcon width={16} />
        </AppButton>
      </HStack>
    </HStack>
  );
}

export default Pagination;
