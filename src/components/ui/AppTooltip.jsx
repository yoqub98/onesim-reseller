import { Box, Text } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { uiColors, uiRadii, uiShadows, uiTransitions } from "../../design-system/tokens";

const placements = {
  top: { bottom: "100%", left: "50%", transform: "translateX(-50%)", mb: "8px" },
  bottom: { top: "100%", left: "50%", transform: "translateX(-50%)", mt: "8px" },
  left: { right: "100%", top: "50%", transform: "translateY(-50%)", mr: "8px" },
  right: { left: "100%", top: "50%", transform: "translateY(-50%)", ml: "8px" }
};

export function AppTooltip({
  children,
  label,
  placement = "top",
  isDisabled = false,
  hasArrow = true,
  delay = 200
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (isDisabled || !label) return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const pos = placements[placement] || placements.top;

  return (
    <Box
      position="relative"
      display="inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && label && (
        <Box
          position="absolute"
          {...pos}
          zIndex={1000}
          pointerEvents="none"
        >
          <Box
            bg={uiColors.textPrimary}
            color="white"
            px={3}
            py={1.5}
            borderRadius={uiRadii.sm}
            fontSize="12px"
            fontWeight="500"
            boxShadow={uiShadows.md}
            whiteSpace="nowrap"
            transition={uiTransitions.standard}
          >
            {label}
            {hasArrow && (
              <Box
                position="absolute"
                w="8px"
                h="8px"
                bg={uiColors.textPrimary}
                transform="rotate(45deg)"
                {...(placement === "top" && { bottom: "-4px", left: "50%", ml: "-4px" })}
                {...(placement === "bottom" && { top: "-4px", left: "50%", ml: "-4px" })}
                {...(placement === "left" && { right: "-4px", top: "50%", mt: "-4px" })}
                {...(placement === "right" && { left: "-4px", top: "50%", mt: "-4px" })}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export function InfoTooltip({ label, placement = "top" }) {
  return (
    <AppTooltip label={label} placement={placement}>
      <Box
        as="span"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        w="16px"
        h="16px"
        borderRadius="50%"
        bg={uiColors.surfaceSoft}
        color={uiColors.textMuted}
        fontSize="11px"
        fontWeight="700"
        cursor="help"
        _hover={{ bg: uiColors.border, color: uiColors.textSecondary }}
        transition={uiTransitions.standard}
      >
        <Text as="span">?</Text>
      </Box>
    </AppTooltip>
  );
}

export default AppTooltip;
