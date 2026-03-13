import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabase";
import { ReactComponent as AppleIcon } from "../assets/icons/appleIcon.svg";
import { ReactComponent as AndroidIcon } from "../assets/icons/androidIcon.svg";

export default function SharedEsimPage() {
  const { token } = useParams();
  const [esim, setEsim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchEsim() {
      const { data, error } = await supabase.rpc("get_shared_esim", {
        p_token: token,
      });
      if (error || !data) {
        setNotFound(true);
      } else {
        setEsim(data);
      }
      setLoading(false);
    }
    fetchEsim();
  }, [token]);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Spinner size="xl" color="orange.400" borderWidth="3px" />
      </Box>
    );
  }

  if (notFound || !esim) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" p={6}>
        <VStack spacing={3} textAlign="center">
          <Text fontSize="4xl">😕</Text>
          <Text fontSize="xl" fontWeight="700" color="gray.800">Link not found</Text>
          <Text fontSize="sm" color="gray.500">This eSIM link is invalid or has expired.</Text>
        </VStack>
      </Box>
    );
  }

  const customerName =
    esim.customer_first_name || esim.customer_last_name
      ? [esim.customer_first_name, esim.customer_last_name].filter(Boolean).join(" ")
      : null;

  const iosLink = esim.activation_code
    ? `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(esim.activation_code)}`
    : null;
  const androidLink = esim.activation_code
    ? `https://esimsetup.android.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(esim.activation_code)}`
    : null;

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="flex-start" justifyContent="center" py={{ base: 0, md: 10 }}>
      <Box
        w="full"
        maxW="460px"
        bg="white"
        borderRadius={{ base: "0", md: "3xl" }}
        minH={{ base: "100vh", md: "auto" }}
        boxShadow={{ base: "none", md: "lg" }}
        px={{ base: 5, md: 8 }}
        py={{ base: 8, md: 10 }}
      >
        <VStack spacing={5} align="stretch">
          {/* Header info */}
          <VStack spacing={1} align="center">
            {customerName && (
              <Text fontSize="xl" fontWeight="700" color="gray.800" textAlign="center">
                {customerName}
              </Text>
            )}
            {esim.package_name && (
              <Text fontSize="md" fontWeight="600" color="gray.700" textAlign="center">
                {esim.package_name}
              </Text>
            )}
            {esim.company_name && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                {esim.company_name}
              </Text>
            )}
          </VStack>

          {/* QR Code */}
          {esim.activation_code && (
            <Box
              bg="gray.100"
              borderRadius="2xl"
              p={{ base: 6, md: 8 }}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                <QRCodeSVG
                  value={esim.activation_code}
                  size={200}
                  level="M"
                  style={{ display: "block" }}
                />
              </Box>
            </Box>
          )}

          {/* Instructions + expiry */}
          <VStack spacing={1} align="center">
            <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="1.6">
              Scan this QR code in your phone's eSIM settings to install your eSIM.
            </Text>
            {esim.expiry_date && (
              <Text fontSize="sm" color="gray.700" fontWeight="600" textAlign="center">
                Install before:{" "}
                {new Date(esim.expiry_date).toLocaleString("en-GB", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </VStack>

          {/* Quick Install Buttons */}
          {esim.activation_code && (
            <VStack spacing={3} w="full">
              {/* iOS */}
              <Box
                as="a"
                href={iosLink}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                w="full"
                px={4}
                py={4}
                borderWidth="2px"
                borderColor="#FE4F18"
                borderRadius="full"
                bg="white"
                textDecoration="none"
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                transition="background 0.15s"
              >
                <HStack spacing={4}>
                  <Box flexShrink={0}>
                    <AppleIcon style={{ width: "32px", height: "32px" }} />
                  </Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="md" fontWeight="700" color="gray.900">
                      Quick Install — iPhone
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="400">
                      Opens eSIM setup automatically
                    </Text>
                  </VStack>
                </HStack>
                <ChevronRightIcon width={18} color="#9CA3AF" />
              </Box>

              {/* Android */}
              <Box
                as="a"
                href={androidLink}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                w="full"
                px={4}
                py={4}
                borderWidth="2px"
                borderColor="#FE4F18"
                borderRadius="full"
                bg="white"
                textDecoration="none"
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                transition="background 0.15s"
              >
                <HStack spacing={4}>
                  <Box flexShrink={0}>
                    <AndroidIcon style={{ width: "32px", height: "32px" }} />
                  </Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="md" fontWeight="700" color="gray.900">
                      Quick Install — Android
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="400">
                      Opens eSIM setup automatically
                    </Text>
                  </VStack>
                </HStack>
                <ChevronRightIcon width={18} color="#9CA3AF" />
              </Box>
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
