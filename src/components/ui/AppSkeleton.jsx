import { Box, HStack, VStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { uiRadii } from "../../design-system/tokens";

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const baseSkeletonStyle = {
  bg: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: `${shimmer} 1.5s ease-in-out infinite`
};

export function AppSkeleton({
  w = "100%",
  h = "16px",
  borderRadius = uiRadii.sm,
  isLoaded = false,
  children
}) {
  if (isLoaded && children) {
    return children;
  }

  return (
    <Box
      w={w}
      h={h}
      borderRadius={borderRadius}
      {...baseSkeletonStyle}
    />
  );
}

export function AppSkeletonText({ lines = 3, spacing = 2, lastLineWidth = "60%" }) {
  return (
    <VStack align="stretch" spacing={spacing} w="full">
      {Array.from({ length: lines }).map((_, idx) => (
        <AppSkeleton
          key={idx}
          h="14px"
          w={idx === lines - 1 ? lastLineWidth : "100%"}
        />
      ))}
    </VStack>
  );
}

export function AppSkeletonCircle({ size = "40px" }) {
  return <AppSkeleton w={size} h={size} borderRadius="50%" />;
}

export function AppSkeletonCard() {
  return (
    <Box
      p={5}
      borderRadius={uiRadii.lg}
      border="1px solid #e5e7eb"
      bg="white"
    >
      <HStack spacing={4} align="start">
        <AppSkeletonCircle size="48px" />
        <VStack align="stretch" flex={1} spacing={3}>
          <AppSkeleton h="18px" w="50%" />
          <AppSkeletonText lines={2} />
        </VStack>
      </HStack>
    </Box>
  );
}

export function AppSkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <VStack align="stretch" spacing={0} w="full">
      <HStack
        spacing={4}
        p={4}
        borderBottom="1px solid #e5e7eb"
        bg="#f9fafb"
      >
        {Array.from({ length: columns }).map((_, idx) => (
          <AppSkeleton key={idx} h="14px" w={idx === 0 ? "120px" : "80px"} />
        ))}
      </HStack>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <HStack
          key={rowIdx}
          spacing={4}
          p={4}
          borderBottom="1px solid #f0f0f0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <AppSkeleton
              key={colIdx}
              h="14px"
              w={colIdx === 0 ? "120px" : "80px"}
            />
          ))}
        </HStack>
      ))}
    </VStack>
  );
}

export default AppSkeleton;
