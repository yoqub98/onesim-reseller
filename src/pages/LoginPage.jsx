import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";
import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { uiColors } from "../design-system/tokens";

/**
 * LoginPage - Authentication page matching Figma design
 *
 * Features:
 * - Email/Password login
 * - Google OAuth (UI only, backend integration pending)
 * - Password visibility toggle
 * - Forgot password link (UI only)
 * - Sign up navigation
 *
 * Backend Integration Notes:
 * - Replace mock navigation with actual Supabase auth
 * - Implement handleLogin with supabase.auth.signInWithPassword()
 * - Implement handleGoogleLogin with supabase.auth.signInWithOAuth()
 * - On success, bootstrap partner profile into AuthContext user shape
 * - Add proper error handling and validation
 * - Store auth tokens securely
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { dict: t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication: accept any credentials, including empty values.
    setTimeout(() => {
      login({
        email: email || "partner@example.com",
        company_name: "Example Company"
      });
      setIsLoading(false);
      navigate("/");
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login({
        email: "google.partner@example.com",
        company_name: "Example Company"
      });
      setIsLoading(false);
      navigate("/");
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
        {/* Overlay */}
        <Box
          position="absolute"
          inset={0}
          bg="blackAlpha.300"
          zIndex={1}
        />

        {/* Background Image */}
        <Box
          as="img"
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop"
          alt="Travel Background"
          w="full"
          h="full"
          objectFit="cover"
        />

        {/* Hero Text */}
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

      {/* Right Side - Login Form */}
      <Flex
        flex="1"
        direction="column"
        justify="center"
        align="center"
        p={{ base: 8, sm: 12, lg: 24 }}
        bg="white"
      >
        <Box w="full" maxW="420px">
          {/* Brand */}
          <Box textAlign={{ base: "center", lg: "left" }} mb="32px">
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
          <Box mb="32px">
            <Heading
              as="h2"
              fontSize="24px"
              fontWeight="bold"
              color={uiColors.textPrimary}
              mb="8px"
            >
              {t.auth?.login?.title || "Tizimga kirish"}
            </Heading>
            <Text fontSize="14px" color={uiColors.textSecondary}>
              {t.auth?.login?.description ||
                "Davom etish uchun hisob ma'lumotlaringizni kiriting"}
            </Text>
          </Box>

          {/* Login Form */}
          <Box as="form" onSubmit={handleLogin} noValidate>
            <Flex direction="column" gap="20px">
              {/* Email Input */}
              <AppInput
                label={t.auth?.fields?.email || "Email manzil"}
                type="email"
                placeholder={t.auth?.fields?.placeholders?.email || "name@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password Input */}
              <Box>
                <Flex justify="space-between" align="center" mb="8px">
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color={uiColors.textPrimary}
                  >
                    {t.auth?.fields?.password || "Parol"}
                  </Text>
                  <Link
                    fontSize="14px"
                    fontWeight="500"
                    color={uiColors.accent}
                    _hover={{ color: uiColors.accentHover }}
                    onClick={() => alert("Forgot password - Coming soon")}
                  >
                    {t.auth?.login?.forgotPassword || "Parolni unutdingizmi?"}
                  </Link>
                </Flex>
                <AppInput
                  type={showPassword ? "text" : "password"}
                  placeholder={t.auth?.fields?.placeholders?.password || "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              </Box>

              {/* Login Button */}
              <AppButton
                variant="primary"
                type="submit"
                w="full"
                h="44px"
                fontSize="15px"
                isLoading={isLoading}
                mt="4px"
              >
                {isLoading
                  ? t.auth?.login?.signingIn || "Kirilmoqda..."
                  : t.auth?.login?.signIn || "Kirish"}
              </AppButton>
            </Flex>
          </Box>

          {/* Divider */}
          <Flex align="center" my="24px">
            <Box flex="1" h="1px" bg={uiColors.border} />
            <Text
              px="12px"
              fontSize="12px"
              textTransform="uppercase"
              color={uiColors.textMuted}
            >
              {t.auth?.or || "Yoki"}
            </Text>
            <Box flex="1" h="1px" bg={uiColors.border} />
          </Flex>

          {/* Google Sign In */}
          <AppButton
            variant="outline"
            w="full"
            h="44px"
            fontSize="14px"
            onClick={handleGoogleLogin}
            isDisabled={isLoading}
            leftIcon={
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            }
          >
            {t.auth?.login?.googleSignIn || "Google orqali kirish"}
          </AppButton>

          {/* Sign Up Link */}
          <Text
            textAlign="center"
            fontSize="14px"
            color={uiColors.textSecondary}
            mt="24px"
          >
            {t.auth?.login?.noAccount || "Ro'yxatdan o'tmaganmisiz?"}{" "}
            <Link
              fontWeight="600"
              color={uiColors.accent}
              _hover={{ color: uiColors.accentHover, textDecoration: "underline" }}
              onClick={() => navigate("/signup")}
            >
              {t.auth?.login?.signUp || "Ro'yxatdan o'tish"}
            </Link>
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
