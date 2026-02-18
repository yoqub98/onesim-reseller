import { Box, HStack, Text } from "@chakra-ui/react";
import { CheckIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiColors, uiRadii } from "../../design-system/tokens";

/**
 * Multi-select dropdown with checkboxes.
 * Props:
 * - value: array of selected values (string[])
 * - options: array of { value, label }
 * - onChange(values: string[]): called when selection changes
 * - placeholder: text when nothing selected
 * - allLabel: label for empty state display
 */
function AppMultiSelect({ value = [], options = [], onChange, placeholder = "", allLabel = "Barchasi" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const displayText = useMemo(() => {
    if (!value.length) return "";
    if (value.length <= 2) {
      return value
        .map((v) => {
          const opt = options.find((o) => o.value === v);
          return opt ? opt.label : v;
        })
        .join(", ");
    }
    const first = options.find((o) => o.value === value[0]);
    return `${first ? first.label : value[0]} +${value.length - 1}`;
  }, [value, options]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleOption = useCallback(
    (optValue) => {
      const next = selectedSet.has(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue];
      onChange(next);
    },
    [value, selectedSet, onChange]
  );

  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange]
  );

  const showClear = value.length > 0;

  return (
    <Box ref={containerRef} position="relative">
      <Box
        position="relative"
        cursor="pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Box
          h="40px"
          borderRadius={uiRadii.sm}
          borderWidth="1px"
          borderColor={isOpen ? uiColors.accent : uiColors.borderStrong}
          bg="white"
          display="flex"
          alignItems="center"
          pl={3}
          pr={showClear ? "60px" : 9}
        >
          <Text
            fontSize="sm"
            color={displayText ? uiColors.textPrimary : uiColors.textMuted}
            noOfLines={1}
          >
            {displayText || placeholder || allLabel}
          </Text>
        </Box>
        {showClear && (
          <Box
            position="absolute"
            right="30px"
            top="50%"
            transform="translateY(-50%)"
            cursor="pointer"
            color={uiColors.textSecondary}
            _hover={{ color: uiColors.textPrimary }}
            onClick={handleClear}
            zIndex={1}
            p={1}
          >
            <XMarkIcon width={14} />
          </Box>
        )}
        <Box
          position="absolute"
          right={2.5}
          top="50%"
          transform="translateY(-50%)"
          pointerEvents="none"
          color={uiColors.textSecondary}
        >
          <ChevronDownIcon width={16} />
        </Box>
      </Box>

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          bg="white"
          borderWidth="1px"
          borderColor={uiColors.borderStrong}
          borderRadius={uiRadii.sm}
          boxShadow="0 4px 12px rgba(0,0,0,0.1)"
          zIndex={20}
          maxH="240px"
          overflowY="auto"
        >
          {options.map((opt) => {
            const isSelected = selectedSet.has(opt.value);
            return (
              <HStack
                key={opt.value}
                px={3}
                py={2}
                cursor="pointer"
                spacing={2}
                bg={isSelected ? uiColors.accentSoft : "transparent"}
                _hover={{ bg: isSelected ? uiColors.accentSoft : "#f1f5f9" }}
                onClick={() => toggleOption(opt.value)}
              >
                <Box
                  w="16px"
                  h="16px"
                  borderRadius="3px"
                  borderWidth="1.5px"
                  borderColor={isSelected ? uiColors.accent : uiColors.borderStrong}
                  bg={isSelected ? uiColors.accent : "white"}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  {isSelected && <CheckIcon width={10} color="white" />}
                </Box>
                <Text fontSize="sm" color={uiColors.textPrimary}>
                  {opt.label}
                </Text>
              </HStack>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default AppMultiSelect;
