import { Box, Input, Text } from "@chakra-ui/react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiColors, uiRadii } from "../../design-system/tokens";

/**
 * Searchable combobox dropdown.
 * Props:
 * - value: current selected value (string)
 * - options: array of { value, label } or plain strings
 * - onChange(value): called when user selects an option
 * - placeholder: input placeholder text
 * - allLabel: label for the "all" option (shown when value is "all")
 */
function AppCombobox({ value, options, onChange, placeholder = "", allLabel = "All" }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
      ),
    [options]
  );

  const filtered = useMemo(() => {
    if (!query) return normalizedOptions;
    const q = query.toLowerCase();
    return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [normalizedOptions, query]);

  const selectedLabel = useMemo(() => {
    if (!value || value === "all") return "";
    const match = normalizedOptions.find((opt) => opt.value === value);
    return match ? match.label : value;
  }, [value, normalizedOptions]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(
    (val) => {
      onChange(val);
      setIsOpen(false);
      setQuery("");
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange("all");
      setQuery("");
    },
    [onChange]
  );

  const showClear = value && value !== "all";

  return (
    <Box ref={containerRef} position="relative">
      <Box position="relative">
        <Input
          ref={inputRef}
          h="40px"
          borderRadius={uiRadii.sm}
          borderWidth="1px"
          borderColor={isOpen ? uiColors.accent : uiColors.borderStrong}
          bg="white"
          color={uiColors.textPrimary}
          fontSize="sm"
          pl={3}
          pr={showClear ? "64px" : 9}
          placeholder={placeholder}
          value={isOpen ? query : selectedLabel || ""}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          _focusVisible={{ outline: "none", borderColor: uiColors.accent }}
        />
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
          <Box
            px={3}
            py={2}
            cursor="pointer"
            fontSize="sm"
            color={uiColors.textSecondary}
            fontStyle="italic"
            bg={value === "all" ? uiColors.accentSoft : "transparent"}
            _hover={{ bg: "#f1f5f9" }}
            onClick={() => handleSelect("all")}
          >
            {allLabel}
          </Box>
          {filtered.map((opt) =>
            opt.value === "all" ? null : (
              <Box
                key={opt.value}
                px={3}
                py={2}
                cursor="pointer"
                fontSize="sm"
                color={uiColors.textPrimary}
                bg={opt.value === value ? uiColors.accentSoft : "transparent"}
                _hover={{ bg: "#f1f5f9" }}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </Box>
            )
          )}
          {filtered.length === 0 && (
            <Text px={3} py={2} fontSize="sm" color={uiColors.textMuted}>
              Natija topilmadi
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

export default AppCombobox;
