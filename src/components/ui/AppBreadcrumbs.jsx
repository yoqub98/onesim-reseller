import { HStack, Link, Text } from "@chakra-ui/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { uiColors } from "../../design-system/tokens";

function AppBreadcrumbs({ items = [], onNavigate }) {
  if (!items.length) {
    return null;
  }

  return (
    <HStack spacing={2} flexWrap="wrap" align="center">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <HStack key={item.key || item.label || index} spacing={2} align="center">
            {isLast ? (
              <Text fontSize="13px" fontWeight="600" color={uiColors.textPrimary}>
                {item.label}
              </Text>
            ) : (
              <Link
                as="button"
                type="button"
                fontSize="13px"
                color={uiColors.textSecondary}
                _hover={{ color: uiColors.textPrimary }}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                    return;
                  }
                  if (onNavigate) {
                    onNavigate(item, index);
                  }
                }}
              >
                {item.label}
              </Link>
            )}
            {!isLast ? <ChevronRightIcon width={14} color={uiColors.textMuted} /> : null}
          </HStack>
        );
      })}
    </HStack>
  );
}

export default AppBreadcrumbs;
