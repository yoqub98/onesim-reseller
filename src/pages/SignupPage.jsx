import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";
import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { uiColors, uiRadii } from "../design-system/tokens";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, verifyOtp, createPartnerRecord } = useAuth();
  const { dict: t } = useLocale();

  // Steps: 'form' | 'otp' | 'creating'
  const [step, setStep] = useState("form");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Company Information
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [inn, setInn] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Contact Person
  const [contactFullName, setContactFullName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contractNumber, setContractNumber] = useState("");

  // OTP
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  // Store form data for partner record creation after OTP
  const formDataRef = useRef(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Store form data for later use
      formDataRef.current = {
        companyName,
        legalName,
        inn,
        address,
        businessEmail: email,
        contactFullName,
        contactPhone,
        contractNumber,
      };

      await signUp(email, password, {
        contactFullName,
        contactPhone,
      });

      // Move to OTP step
      setStep("otp");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 8).split("");
      const newOtp = [...otpCode];
      digits.forEach((digit, i) => {
        if (index + i < 8) newOtp[index + i] = digit;
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(index + digits.length, 7);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = value.replace(/\D/g, "");
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 7) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const token = otpCode.join("");
    if (token.length !== 8) {
      setError("Please enter the 8-digit code");
      setIsLoading(false);
      return;
    }

    try {
      // Verify OTP - this creates the session
      await verifyOtp(email, token);

      // Now create the partner record
      setStep("creating");
      await createPartnerRecord(formDataRef.current);

      navigate("/pending-account");
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setStep("otp");
    } finally {
      setIsLoading(false);
    }
  };

  const renderOtpStep = () => (
    <Box as="form" onSubmit={handleVerifyOtp}>
      <Flex direction="column" gap="24px">
        <Box textAlign="center">
          <Box
            w="64px"
            h="64px"
            mx="auto"
            mb="16px"
            bg={uiColors.surfaceSoft}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="28px"
          >
            ✉️
          </Box>
          <Heading as="h2" fontSize="22px" fontWeight="bold" color={uiColors.textPrimary} mb="8px">
            {t.auth?.otp?.title || "Email tasdiqlash"}
          </Heading>
          <Text fontSize="14px" color={uiColors.textSecondary}>
            {t.auth?.otp?.description || "Tasdiqlash kodi yuborildi:"}{" "}
            <Text as="span" fontWeight="600" color={uiColors.textPrimary}>
              {email}
            </Text>
          </Text>
        </Box>

        {/* OTP Input */}
        <Flex gap="8px" justify="center">
          {otpCode.map((digit, index) => (
            <Box
              key={index}
              as="input"
              ref={(el) => (otpRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={index === 0 ? 8 : 1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              w="42px"
              h="52px"
              textAlign="center"
              fontSize="22px"
              fontWeight="bold"
              border="1px solid"
              borderColor={uiColors.border}
              borderRadius={uiRadii.sm}
              outline="none"
              _focus={{ borderColor: uiColors.accent, boxShadow: `0 0 0 1px ${uiColors.accent}` }}
              color={uiColors.textPrimary}
            />
          ))}
        </Flex>

        {error && (
          <Text fontSize="13px" color="red.500" textAlign="center">
            {error}
          </Text>
        )}

        <AppButton
          variant="primary"
          type="submit"
          w="full"
          h="44px"
          fontSize="15px"
          isLoading={isLoading}
        >
          {isLoading
            ? step === "creating"
              ? t.auth?.otp?.creating || "Hisob yaratilmoqda..."
              : t.auth?.otp?.verifying || "Tasdiqlanmoqda..."
            : t.auth?.otp?.verify || "Tasdiqlash"}
        </AppButton>

        <Text fontSize="13px" color={uiColors.textMuted} textAlign="center">
          {t.auth?.otp?.noCode || "Kod kelmadimi?"}{" "}
          <Link
            color={uiColors.accent}
            fontWeight="500"
            _hover={{ textDecoration: "underline" }}
            onClick={async () => {
              setError("");
              try {
                await signUp(email, password, { contactFullName, contactPhone });
                setError(t.auth?.otp?.resent || "Yangi kod yuborildi!");
              } catch (err) {
                setError(err.message);
              }
            }}
          >
            {t.auth?.otp?.resend || "Qayta yuborish"}
          </Link>
        </Text>
      </Flex>
    </Box>
  );

  const renderFormStep = () => (
    <Box as="form" onSubmit={handleSignup}>
      <Flex direction="column" gap="24px">
        {/* Company Information Section */}
        <Box>
          <Text fontSize="16px" fontWeight="600" color={uiColors.textPrimary} mb="16px">
            {t.auth?.signup?.companyInfo || "Kompaniya ma'lumotlari"}
          </Text>
          <Flex direction="column" gap="16px">
            <AppInput
              label={t.auth?.fields?.companyName || "Kompaniya nomi"}
              placeholder={t.auth?.fields?.placeholders?.companyName || "OOO «Misol»"}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <AppInput
              label={t.auth?.fields?.legalName || "Rasmiy yuridik nomi"}
              placeholder={t.auth?.fields?.placeholders?.legalName || "Mas'uliyati cheklangan jamiyat «Misol»"}
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              required
            />
            <AppInput
              label={t.auth?.fields?.inn || "INN (Soliq raqami)"}
              placeholder={t.auth?.fields?.placeholders?.inn || "123456789"}
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              required
            />
            <AppInput
              label={t.auth?.fields?.address || "Manzil"}
              placeholder={t.auth?.fields?.placeholders?.address || "Toshkent sh., Amir Temur ko'chasi, 123"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Flex>
        </Box>

        {/* Divider */}
        <Box h="1px" w="full" bg={uiColors.border} />

        {/* Contact Person Section */}
        <Box>
          <Text fontSize="16px" fontWeight="600" color={uiColors.textPrimary} mb="16px">
            {t.auth?.signup?.contactPerson || "Kontakt shaxs"}
          </Text>
          <Flex direction="column" gap="16px">
            <AppInput
              label={t.auth?.fields?.contactFullName || "F.I.O"}
              placeholder={t.auth?.fields?.placeholders?.contactFullName || "Ivanov Ivan Ivanovich"}
              value={contactFullName}
              onChange={(e) => setContactFullName(e.target.value)}
              required
            />
            <AppInput
              label={t.auth?.fields?.contactPhone || "Telefon"}
              type="tel"
              placeholder={t.auth?.fields?.placeholders?.contactPhone || "+998 90 123 45 67"}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
            />
            <AppInput
              label={t.auth?.fields?.contractNumber || "Shartnoma raqami"}
              placeholder={t.auth?.fields?.placeholders?.contractNumber || "№DOG-2024-001"}
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              helperText={
                t.auth?.fields?.contractHelper ||
                "Ixtiyoriy, tekshiruvdan keyin tayinlanadi"
              }
            />
          </Flex>
        </Box>

        {/* Divider */}
        <Box h="1px" w="full" bg={uiColors.border} />

        {/* Account Credentials */}
        <Box>
          <Text fontSize="16px" fontWeight="600" color={uiColors.textPrimary} mb="16px">
            {t.auth?.signup?.credentials || "Hisob ma'lumotlari"}
          </Text>
          <Flex direction="column" gap="16px">
            <AppInput
              label={t.auth?.fields?.email || "Email"}
              type="email"
              placeholder={t.auth?.fields?.placeholders?.email || "info@company.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AppInput
              label={t.auth?.fields?.password || "Parol"}
              type={showPassword ? "text" : "password"}
              placeholder={t.auth?.fields?.placeholders?.password || "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText={t.auth?.fields?.passwordHelper || "Kamida 6 ta belgi"}
              rightElement={
                <Box
                  as="button"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  color={uiColors.textMuted}
                  _hover={{ color: uiColors.textSecondary }}
                >
                  {showPassword ? (
                    <EyeSlashIcon style={{ width: 20, height: 20 }} />
                  ) : (
                    <EyeIcon style={{ width: 20, height: 20 }} />
                  )}
                </Box>
              }
            />
          </Flex>
        </Box>

        {/* Error message */}
        {error && (
          <Text fontSize="13px" color="red.500">
            {error}
          </Text>
        )}

        {/* Terms and Conditions */}
        <Box p="12px" bg={uiColors.surfaceSoft} borderRadius={uiRadii.sm}>
          <Text fontSize="13px" color={uiColors.textSecondary}>
            {t.auth?.signup?.termsPrefix || "«Ro'yxatdan o'tish» tugmasini bosish orqali siz"}{" "}
            <Link color={uiColors.accent} fontWeight="500" _hover={{ textDecoration: "underline" }}>
              {t.auth?.signup?.terms || "Foydalanish shartlari"}
            </Link>{" "}
            {t.auth?.signup?.and || "va"}{" "}
            <Link color={uiColors.accent} fontWeight="500" _hover={{ textDecoration: "underline" }}>
              {t.auth?.signup?.privacy || "Maxfiylik siyosati"}
            </Link>
            {t.auth?.signup?.termsSuffix || "ga rozilik bildirasiz"}
          </Text>
        </Box>

        {/* Signup Button */}
        <AppButton
          variant="primary"
          type="submit"
          w="full"
          h="44px"
          fontSize="15px"
          isLoading={isLoading}
        >
          {isLoading
            ? t.auth?.signup?.registering || "Ro'yxatdan o'tilmoqda..."
            : t.auth?.signup?.register || "Ro'yxatdan o'tish"}
        </AppButton>
      </Flex>
    </Box>
  );

  return (
    <Flex minH="100vh" w="full" bg="white" position="relative">
      {/* Language Switcher - Top Right */}
      <Box position="absolute" top="20px" right="20px" zIndex={10}>
        <LanguageSwitcher />
      </Box>

      {/* Left Side - Hero Image (Hidden on mobile) */}
      <Box display={{ base: "none", lg: "flex" }} w="50%" position="relative" bg="slate.900">
        <Box position="absolute" inset={0} bg="blackAlpha.300" zIndex={1} />
        <Box
          as="img"
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop"
          alt="Travel Background"
          w="full"
          h="full"
          objectFit="cover"
        />
        <Box position="absolute" bottom="48px" left="48px" zIndex={2} color="white" maxW="md">
          <Heading as="h2" fontSize="36px" fontWeight="bold" mb="16px" lineHeight="1.2">
            {t.auth?.hero?.title || "Dunyo bo'ylab aloqada qoling"}
          </Heading>
          <Text fontSize="18px" color="whiteAlpha.800" lineHeight="1.6">
            {t.auth?.hero?.subtitle ||
              "OneSIM hamkorlik portali orqali mijozlaringizga eng yaxshi eSIM xizmatlarini taqdim eting."}
          </Text>
        </Box>
      </Box>

      {/* Right Side - Form */}
      <Flex
        flex="1"
        direction="column"
        justify="center"
        align="center"
        p={{ base: 6, sm: 8, lg: 12 }}
        bg="white"
        overflowY="auto"
      >
        <Box w="full" maxW="520px" py={{ base: 8, lg: 12 }}>
          {/* Brand */}
          <Box textAlign={{ base: "center", lg: "left" }} mb="24px">
            <Heading as="h1" fontSize="28px" fontWeight="bold" color={uiColors.accent} mb="8px">
              {t.brandName || "OneSIM Reseller"}
            </Heading>
            <Text fontSize="14px" color={uiColors.textMuted}>
              {t.auth?.subtitle || "B2B Hamkorlik Portali"}
            </Text>
          </Box>

          {step === "form" && (
            <>
              {/* Title */}
              <Box mb="24px">
                <Heading as="h2" fontSize="24px" fontWeight="bold" color={uiColors.textPrimary} mb="8px">
                  {t.auth?.signup?.title || "Ro'yxatdan o'tish"}
                </Heading>
                <Text fontSize="14px" color={uiColors.textSecondary}>
                  {t.auth?.signup?.description || "Hamkor bo'lish uchun kompaniya ma'lumotlarini kiriting"}
                </Text>
              </Box>
              {renderFormStep()}
            </>
          )}

          {(step === "otp" || step === "creating") && renderOtpStep()}

          {/* Login Link */}
          {step === "form" && (
            <Text textAlign="center" fontSize="14px" color={uiColors.textSecondary} mt="24px">
              {t.auth?.signup?.haveAccount || "Hisobingiz bormi?"}{" "}
              <Link
                fontWeight="600"
                color={uiColors.accent}
                _hover={{ color: uiColors.accentHover, textDecoration: "underline" }}
                onClick={() => navigate("/login")}
              >
                {t.auth?.signup?.signIn || "Kirish"}
              </Link>
            </Text>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}
