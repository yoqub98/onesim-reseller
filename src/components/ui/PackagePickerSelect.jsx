import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { uiColors } from "../../design-system/tokens";
import PackageDisplay from "./PackageDisplay";
import SurfaceCard from "./SurfaceCard";

function PackagePickerSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  clearLabel,
  onChange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selectedPackage = useMemo(
    () => options.find((item) => item.id === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const normalized = query.trim().toLowerCase();
    return options.filter((item) => {
      const searchable = [
        item.name,
        item.destination,
        item.countryCode,
        item.dataLabel,
        `${item.validityDays || 0}`
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalized);
    });
  }, [options, query]);

  useEffect(() => {
    function onOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  return (
    <Box ref={containerRef} position="relative">
      <SurfaceCard
        as="button"
        type="button"
        w="full"
        minH="54px"
        p={2.5}
        borderRadius="10px"
        borderColor={isOpen ? uiColors.accent : uiColors.borderStrong}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <HStack justify="space-between" spacing={3}>
          {selectedPackage ? (
            <HStack justify="space-between" w="full">
              <PackageDisplay
                countryCode={selectedPackage.countryCode}
                destination={selectedPackage.destination || selectedPackage.name}
                dataLabel={`${selectedPackage.dataLabel || "-"} - ${selectedPackage.validityDays || 0} kun`}
                flagSize={28}
              />
              <Box
                as="button"
                type="button"
                color={uiColors.textSecondary}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange("");
                }}
              >
                <XMarkIcon width={15} />
              </Box>
            </HStack>
          ) : (
            <Text color={uiColors.textSecondary} fontSize="sm" textAlign="left">
              {placeholder}
            </Text>
          )}
          {!selectedPackage ? (
            <Box color={uiColors.textSecondary}>
              <ChevronDownIcon width={16} />
            </Box>
          ) : null}
        </HStack>
      </SurfaceCard>

      {isOpen ? (
        <SurfaceCard
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          zIndex={70}
          borderRadius="10px"
          p={2.5}
          boxShadow="0px 12px 30px rgba(15, 23, 43, 0.16)"
        >
          <Box position="relative">
            <Box position="absolute" left={2.5} top="50%" transform="translateY(-50%)" color={uiColors.textSecondary}>
              <MagnifyingGlassIcon width={14} />
            </Box>
            <Input
              h="36px"
              pl={8}
              borderColor={uiColors.borderStrong}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Box>

          <VStack mt={2.5} align="stretch" spacing={1.5} maxH="240px" overflowY="auto">
            {value ? (
              <SurfaceCard
                as="button"
                type="button"
                textAlign="left"
                p={2.5}
                borderRadius="8px"
                borderColor={uiColors.border}
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                  setQuery("");
                }}
              >
                <Text fontSize="sm" color={uiColors.textSecondary}>{clearLabel}</Text>
              </SurfaceCard>
            ) : null}
            {filteredOptions.length ? (
              filteredOptions.map((item) => (
                <SurfaceCard
                  key={item.id}
                  as="button"
                  type="button"
                  textAlign="left"
                  p={2.5}
                  borderRadius="8px"
                  borderColor={item.id === value ? uiColors.accent : uiColors.border}
                  bg={item.id === value ? uiColors.accentSoft : "white"}
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <HStack justify="space-between" align="start">
                    <PackageDisplay
                      countryCode={item.countryCode}
                      destination={item.destination || item.name}
                      dataLabel={`${item.dataLabel || "-"} - ${item.validityDays || 0} kun`}
                      flagSize={24}
                      titleSize="sm"
                      subtitleSize="xs"
                    />
                    <Text fontSize="xs" color={uiColors.textSecondary}>
                      {item.name}
                    </Text>
                  </HStack>
                </SurfaceCard>
              ))
            ) : (
              <Text py={2} textAlign="center" fontSize="sm" color={uiColors.textMuted}>
                {emptyLabel}
              </Text>
            )}
          </VStack>
        </SurfaceCard>
      ) : null}
    </Box>
  );
}

export default PackagePickerSelect;
