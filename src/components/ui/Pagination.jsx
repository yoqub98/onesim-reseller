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
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

/**
 * Reusable pagination component.
 *
 * @param {object} props
 * @param {number} props.currentPage  - 1-based current page
 * @param {number} props.totalPages   - total number of pages
 * @param {(page: number) => void} props.onPageChange
 * @param {number} [props.totalItems] - optional total item count for "X–Y of Z" label
 * @param {number} [props.pageSize]   - optional page size for range label
 * @param {string} [props.itemLabel]  - optional label (e.g. "ta tarif")
 */
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
          {rangeStart}–{rangeEnd} / {totalItems} {itemLabel || ""}
        </Text>
      ) : (
        <Text />
      )}

      <HStack spacing={1}>
        <AppButton
          variant="ghost"
          h="34px"
          minW="34px"
          px={0}
          borderRadius={uiRadii.sm}
          isDisabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeftIcon width={16} />
        </AppButton>

        {pages.map((page, idx) =>
          page === "..." ? (
            <Text
              key={`ellipsis-${idx}`}
              fontSize="sm"
              color={uiColors.textMuted}
              px={1}
              userSelect="none"
            >
              ...
            </Text>
          ) : (
            <AppButton
              key={page}
              variant={page === currentPage ? "primary" : "ghost"}
              h="34px"
              minW="34px"
              px={0}
              borderRadius={uiRadii.sm}
              fontSize="sm"
              fontWeight={page === currentPage ? "700" : "500"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </AppButton>
          )
        )}

        <AppButton
          variant="ghost"
          h="34px"
          minW="34px"
          px={0}
          borderRadius={uiRadii.sm}
          isDisabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRightIcon width={16} />
        </AppButton>
      </HStack>
    </HStack>
  );
}

export default Pagination;
