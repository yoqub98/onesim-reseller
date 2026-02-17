import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";
import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { uiColors, uiRadii } from "../design-system/tokens";

/**
 * SignupPage - Partner registration page
 *
 * Form Fields:
 * - Company Information:
 *   - Company Name (Название компании)
 *   - Official Legal Name (Официальное юридическое наименование)
 *   - ИНН (Tax ID)
 *   - Address (Адрес)
 *   - Email
 *   - Password
 *
 * - Contact Person (Контактное лицо):
 *   - Full Name (ФИО)
 *   - Phone Number (Телефон)
 *   - Contract Number (Договор-номер)
 *
 * Backend Integration Notes:
 * - Replace mock signup with Supabase auth.signUp()
 * - Create partner profile in database after signup
 * - Set profiles.user_type='partner' before creating partners row
 * - Send email verification
 * - Handle validation errors
 * - Store contract information securely
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { dict: t } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSignup = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock registration - navigate after 1.5s
    setTimeout(() => {
      login({
        email: email || "partner@example.com",
        company_name: companyName || "Example Company",
        legal_name: legalName,
        inn,
        address,
        contact_full_name: contactFullName,
        contact_phone: contactPhone,
        contract_number: contractNumber,
        approval_status: "pending",
        registered_at: new Date().toISOString()
      });
      setIsLoading(false);
      // TODO: Replace with actual Supabase registration
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: {
      //       company_name: companyName,
      //       legal_name: legalName,
      //       inn: inn,
      //       address: address,
      //       contact_full_name: contactFullName,
      //       contact_phone: contactPhone,
      //       contract_number: contractNumber
      //     }
      //   }
      // });
      //
      // Then create partner record in your database
      navigate("/pending-account");
    }, 1500);
  };

  return (
    <Flex minH="100vh" w="full" bg="white" position="relative">
      {/* Language Switcher - Top Right */}
      <Box position="absolute" top="20px" right="20px" zIndex={10}>
        <LanguageSwitcher />
      </Box>
      {/* Left Side - Hero Image (Hidden on mobile) */}
      <Box
        display={{ base: "none", lg: "flex" }}
        w="50%"
        position="relative"
        bg="slate.900"
      >
        <Box position="absolute" inset={0} bg="blackAlpha.300" zIndex={1} />
        <Box
          as="img"
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop"
          alt="Travel Background"
          w="full"
          h="full"
          objectFit="cover"
        />
        <Box
          position="absolute"
          bottom="48px"
          left="48px"
          zIndex={2}
          color="white"
          maxW="md"
        >
          <Heading
            as="h2"
            fontSize="36px"
            fontWeight="bold"
            mb="16px"
            lineHeight="1.2"
          >
            {t.auth?.hero?.title || "Dunyo bo'ylab aloqada qoling"}
          </Heading>
          <Text fontSize="18px" color="whiteAlpha.800" lineHeight="1.6">
            {t.auth?.hero?.subtitle ||
              "OneSIM hamkorlik portali orqali mijozlaringizga eng yaxshi eSIM xizmatlarini taqdim eting."}
          </Text>
        </Box>
      </Box>

      {/* Right Side - Signup Form */}
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
            <Heading
              as="h1"
              fontSize="28px"
              fontWeight="bold"
              color={uiColors.accent}
              mb="8px"
            >
              {t.brandName || "OneSIM Reseller"}
            </Heading>
            <Text fontSize="14px" color={uiColors.textMuted}>
              {t.auth?.subtitle || "B2B Hamkorlik Portali"}
            </Text>
          </Box>

          {/* Title */}
          <Box mb="24px">
            <Heading
              as="h2"
              fontSize="24px"
              fontWeight="bold"
              color={uiColors.textPrimary}
              mb="8px"
            >
              {t.auth?.signup?.title || "Ro'yxatdan o'tish"}
            </Heading>
            <Text fontSize="14px" color={uiColors.textSecondary}>
              {t.auth?.signup?.description ||
                "Hamkor bo'lish uchun kompaniya ma'lumotlarini kiriting"}
            </Text>
          </Box>

          {/* Signup Form */}
          <Box as="form" onSubmit={handleSignup}>
            <Flex direction="column" gap="24px">
              {/* Company Information Section */}
              <Box>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color={uiColors.textPrimary}
                  mb="16px"
                >
                  {t.auth?.signup?.companyInfo || "Информация о компании"}
                </Text>
                <Flex direction="column" gap="16px">
                  <AppInput
                    label={t.auth?.fields?.companyName || "Название компании"}
                    placeholder={t.auth?.fields?.placeholders?.companyName || "ООО «Пример»"}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />

                  <AppInput
                    label={
                      t.auth?.fields?.legalName ||
                      "Официальное юридическое наименование"
                    }
                    placeholder={t.auth?.fields?.placeholders?.legalName || "Общество с ограниченной ответственностью «Пример»"}
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    required
                  />

                  <AppInput
                    label={t.auth?.fields?.inn || "ИНН"}
                    placeholder={t.auth?.fields?.placeholders?.inn || "123456789"}
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    required
                  />

                  <AppInput
                    label={t.auth?.fields?.address || "Адрес"}
                    placeholder={t.auth?.fields?.placeholders?.address || "г. Ташкент, ул. Примерная, д. 123"}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />

                  <AppInput
                    label={t.auth?.fields?.email || "Email"}
                    type="email"
                    placeholder={t.auth?.fields?.placeholders?.email || "info@company.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <AppInput
                    label={t.auth?.fields?.password || "Пароль"}
                    type={showPassword ? "text" : "password"}
                    placeholder={t.auth?.fields?.placeholders?.password || "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    helperText={
                      t.auth?.fields?.passwordHelper ||
                      "Минимум 8 символов"
                    }
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

              {/* Divider */}
              <Box h="1px" w="full" bg={uiColors.border} />

              {/* Contact Person Section */}
              <Box>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color={uiColors.textPrimary}
                  mb="16px"
                >
                  {t.auth?.signup?.contactPerson || "Контактное лицо"}
                </Text>
                <Flex direction="column" gap="16px">
                  <AppInput
                    label={t.auth?.fields?.contactFullName || "ФИО"}
                    placeholder={t.auth?.fields?.placeholders?.contactFullName || "Иванов Иван Иванович"}
                    value={contactFullName}
                    onChange={(e) => setContactFullName(e.target.value)}
                    required
                  />

                  <AppInput
                    label={t.auth?.fields?.contactPhone || "Телефон"}
                    type="tel"
                    placeholder={t.auth?.fields?.placeholders?.contactPhone || "+998 90 123 45 67"}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />

                  <AppInput
                    label={t.auth?.fields?.contractNumber || "Договор-номер"}
                    placeholder={t.auth?.fields?.placeholders?.contractNumber || "№ДОГ-2024-001"}
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    helperText={
                      t.auth?.fields?.contractHelper ||
                      "Опционально, будет присвоен после проверки"
                    }
                  />
                </Flex>
              </Box>

              {/* Terms and Conditions */}
              <Box
                p="12px"
                bg={uiColors.surfaceSoft}
                borderRadius={uiRadii.sm}
              >
                <Text fontSize="13px" color={uiColors.textSecondary}>
                  {t.auth?.signup?.termsPrefix || "Нажимая «Зарегистрироваться», вы соглашаетесь с"}{" "}
                  <Link
                    color={uiColors.accent}
                    fontWeight="500"
                    _hover={{ textDecoration: "underline" }}
                  >
                    {t.auth?.signup?.terms || "Условиями использования"}
                  </Link>{" "}
                  {t.auth?.signup?.and || "и"}{" "}
                  <Link
                    color={uiColors.accent}
                    fontWeight="500"
                    _hover={{ textDecoration: "underline" }}
                  >
                    {t.auth?.signup?.privacy || "Политикой конфиденциальности"}
                  </Link>
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
                  ? t.auth?.signup?.registering || "Регистрация..."
                  : t.auth?.signup?.register || "Зарегистрироваться"}
              </AppButton>
            </Flex>
          </Box>

          {/* Login Link */}
          <Text
            textAlign="center"
            fontSize="14px"
            color={uiColors.textSecondary}
            mt="24px"
          >
            {t.auth?.signup?.haveAccount || "Уже есть аккаунт?"}{" "}
            <Link
              fontWeight="600"
              color={uiColors.accent}
              _hover={{ color: uiColors.accentHover, textDecoration: "underline" }}
              onClick={() => navigate("/login")}
            >
              {t.auth?.signup?.signIn || "Войти"}
            </Link>
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
