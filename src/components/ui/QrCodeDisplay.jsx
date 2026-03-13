/**
 * QrCodeDisplay - Displays QR code with copy/print actions
 *
 * Features:
 * - QR code image from API or local generation
 * - Copy activation code button
 * - Copy install link button
 * - Print QR code button
 * - Responsive sizes
 */
import {
  ClipboardDocumentIcon,
  PrinterIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from "@heroicons/react/24/outline";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { uiColors, uiRadii, uiShadows } from "../../design-system/tokens";
import { AppButton, AppIconButton } from "./AppButton";
import SurfaceCard from "./SurfaceCard";

const sizes = {
  sm: { qrSize: 120, padding: 2 },
  md: { qrSize: 160, padding: 3 },
  lg: { qrSize: 200, padding: 4 }
};

/**
 * Generates QR code URL using external API
 * TODO: Backend - Replace with local QR generation for offline support
 */
function generateQrUrl(data, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export function QrCodeDisplay({
  qrCodeUrl,
  activationCode,
  iccid,
  size = "md",
  showActions = true,
  onCopy,
  onPrint
}) {
  const dim = sizes[size] || sizes.md;
  const qrSrc = qrCodeUrl || generateQrUrl(activationCode || `ICCID:${iccid}`, dim.qrSize);

  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      onCopy?.(value, label);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePrint = () => {
    // Create print window with QR code
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>eSIM QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
            }
            img { max-width: 300px; }
            .iccid {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
              font-family: monospace;
            }
            .code {
              margin-top: 10px;
              font-size: 11px;
              color: #999;
              word-break: break-all;
              max-width: 300px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrSrc}" alt="eSIM QR Code" />
            ${iccid ? `<div class="iccid">ICCID: ${iccid}</div>` : ""}
            ${activationCode ? `<div class="code">${activationCode}</div>` : ""}
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
    onPrint?.();
  };

  return (
    <VStack spacing={3} align="center">
      <Box
        p={dim.padding}
        borderWidth="1px"
        borderColor={uiColors.border}
        borderRadius={uiRadii.md}
        bg="white"
        boxShadow={uiShadows.soft}
      >
        <Box
          as="img"
          src={qrSrc}
          alt="eSIM QR Code"
          w={`${dim.qrSize}px`}
          h={`${dim.qrSize}px`}
          borderRadius="8px"
        />
      </Box>

      {showActions && (
        <HStack spacing={2}>
          {activationCode && (
            <AppIconButton
              aria-label="Copy activation code"
              icon={<ClipboardDocumentIcon width={16} />}
              variant="outline"
              size="sm"
              onClick={() => handleCopy(activationCode, "Activation code")}
            />
          )}
          <AppIconButton
            aria-label="Print QR code"
            icon={<PrinterIcon width={16} />}
            variant="outline"
            size="sm"
            onClick={handlePrint}
          />
        </HStack>
      )}
    </VStack>
  );
}

/**
 * QrCodeCard - Full card with QR code and install instructions
 */
export function QrCodeCard({
  qrCodeUrl,
  activationCode,
  iccid,
  iosLink,
  androidLink,
  onCopy,
  onPrint
}) {
  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      onCopy?.(value, label);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <SurfaceCard p={5}>
      <VStack spacing={5} align="center">
        <Text fontWeight="700" color={uiColors.textPrimary}>
          eSIM o'rnatish
        </Text>

        <QrCodeDisplay
          qrCodeUrl={qrCodeUrl}
          activationCode={activationCode}
          iccid={iccid}
          size="md"
          showActions={false}
          onCopy={onCopy}
          onPrint={onPrint}
        />

        <VStack spacing={2} w="full">
          {iosLink && (
            <AppButton
              variant="outline"
              w="full"
              size="sm"
              leftIcon={<DevicePhoneMobileIcon width={16} />}
              onClick={() => handleCopy(iosLink, "iOS link")}
            >
              iOS uchun nusxalash
            </AppButton>
          )}
          {androidLink && (
            <AppButton
              variant="outline"
              w="full"
              size="sm"
              leftIcon={<ComputerDesktopIcon width={16} />}
              onClick={() => handleCopy(androidLink, "Android link")}
            >
              Android uchun nusxalash
            </AppButton>
          )}
        </VStack>

        {activationCode && (
          <Box w="full" pt={3} borderTopWidth="1px" borderColor={uiColors.border}>
            <Text fontSize="11px" color={uiColors.textMuted} textAlign="center" mb={2}>
              Manual o'rnatish kodi:
            </Text>
            <Box
              bg={uiColors.surfaceSoft}
              p={2}
              borderRadius={uiRadii.sm}
              onClick={() => handleCopy(activationCode, "Activation code")}
              cursor="pointer"
              _hover={{ bg: uiColors.border }}
              transition="background 0.15s ease"
            >
              <Text
                fontSize="11px"
                fontFamily="mono"
                color={uiColors.textSecondary}
                wordBreak="break-all"
                textAlign="center"
              >
                {activationCode}
              </Text>
            </Box>
          </Box>
        )}
      </VStack>
    </SurfaceCard>
  );
}

/**
 * InstallLinksButtons - Row of copy buttons for install links
 */
export function InstallLinksButtons({ iosLink, androidLink, manualCode, onCopy, size = "sm" }) {
  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      onCopy?.(value, label);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <HStack spacing={2} flexWrap="wrap">
      {iosLink && (
        <AppButton
          variant="outline"
          size={size}
          leftIcon={<DevicePhoneMobileIcon width={14} />}
          onClick={() => handleCopy(iosLink, "iOS link")}
        >
          iOS
        </AppButton>
      )}
      {androidLink && (
        <AppButton
          variant="outline"
          size={size}
          leftIcon={<ComputerDesktopIcon width={14} />}
          onClick={() => handleCopy(androidLink, "Android link")}
        >
          Android
        </AppButton>
      )}
      {manualCode && (
        <AppButton
          variant="ghost"
          size={size}
          leftIcon={<ClipboardDocumentIcon width={14} />}
          onClick={() => handleCopy(manualCode, "Manual code")}
        >
          Kod nusxalash
        </AppButton>
      )}
    </HStack>
  );
}

export default QrCodeDisplay;
