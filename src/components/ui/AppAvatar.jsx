import { Box, HStack, Image, Text } from "@chakra-ui/react";
import { UserIcon } from "@heroicons/react/24/solid";
import { uiColors, uiTransitions } from "../../design-system/tokens";

const avatarSizes = {
  xs: { size: "24px", fontSize: "10px", iconSize: 12 },
  sm: { size: "32px", fontSize: "12px", iconSize: 16 },
  md: { size: "40px", fontSize: "14px", iconSize: 20 },
  lg: { size: "48px", fontSize: "16px", iconSize: 24 },
  xl: { size: "64px", fontSize: "20px", iconSize: 32 },
  "2xl": { size: "80px", fontSize: "24px", iconSize: 40 }
};

const statusColors = {
  online: "#22c55e",
  offline: "#9ca3af",
  busy: "#ef4444",
  away: "#f59e0b"
};

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppAvatar({
  src,
  name,
  size = "md",
  status,
  showBorder = false,
  bg
}) {
  const dim = avatarSizes[size] || avatarSizes.md;
  const initials = getInitials(name);
  const bgColor = bg || uiColors.surfaceSoft;

  return (
    <Box position="relative" display="inline-flex">
      <Box
        w={dim.size}
        h={dim.size}
        borderRadius="50%"
        overflow="hidden"
        bg={bgColor}
        border={showBorder ? "2px solid white" : "none"}
        boxShadow={showBorder ? "0 0 0 1px " + uiColors.border : "none"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {src ? (
          <Image
            src={src}
            alt={name || "Avatar"}
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : initials ? (
          <Text
            fontSize={dim.fontSize}
            fontWeight="600"
            color={uiColors.textSecondary}
            userSelect="none"
          >
            {initials}
          </Text>
        ) : (
          <UserIcon width={dim.iconSize} color={uiColors.textMuted} />
        )}
      </Box>

      {status && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          w={size === "xs" ? "8px" : size === "sm" ? "10px" : "12px"}
          h={size === "xs" ? "8px" : size === "sm" ? "10px" : "12px"}
          borderRadius="50%"
          bg={statusColors[status] || statusColors.offline}
          border="2px solid white"
        />
      )}
    </Box>
  );
}

export function AppAvatarGroup({ children, max = 4, size = "md", spacing = -2 }) {
  const avatars = Array.isArray(children) ? children : [children];
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const dim = avatarSizes[size] || avatarSizes.md;

  return (
    <HStack spacing={spacing}>
      {visible.map((avatar, idx) => (
        <Box
          key={idx}
          zIndex={visible.length - idx}
          transition={uiTransitions.standard}
          _hover={{ transform: "translateY(-2px)", zIndex: 100 }}
        >
          {avatar}
        </Box>
      ))}
      {remaining > 0 && (
        <Box
          w={dim.size}
          h={dim.size}
          borderRadius="50%"
          bg={uiColors.surfaceSoft}
          border="2px solid white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={0}
        >
          <Text fontSize={dim.fontSize} fontWeight="600" color={uiColors.textSecondary}>
            +{remaining}
          </Text>
        </Box>
      )}
    </HStack>
  );
}

export default AppAvatar;
