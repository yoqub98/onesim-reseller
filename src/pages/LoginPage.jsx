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

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { dict: t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t.auth?.errors?.required || "Email va parolni kiriting");
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      // Navigation is handled by App.js routing based on auth state
    } catch (err) {
      if (err.message?.includes("Invalid login credentials")) {
        setError(t.auth?.errors?.invalidCredentials || "Email yoki parol noto'g'ri");
      } else if (err.message?.includes("Email not confirmed")) {
        setError(t.auth?.errors?.emailNotConfirmed || "Email tasdiqlanmagan. Iltimos, emailingizni tekshiring.");
      } else {
        setError(err.message || "Kirish muvaffaqiyatsiz bo'ldi");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <Heading as="h1" fontSize="28px" fontWeight="bold" color={uiColors.accent} mb="8px">
              {t.brandName || "OneSIM Reseller"}
            </Heading>
            <Text fontSize="14px" color={uiColors.textMuted}>
              {t.auth?.subtitle || "B2B Hamkorlik Portali"}
            </Text>
          </Box>

          {/* Title */}
          <Box mb="32px">
            <Heading as="h2" fontSize="24px" fontWeight="bold" color={uiColors.textPrimary} mb="8px">
              {t.auth?.login?.title || "Tizimga kirish"}
            </Heading>
            <Text fontSize="14px" color={uiColors.textSecondary}>
              {t.auth?.login?.description || "Davom etish uchun hisob ma'lumotlaringizni kiriting"}
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
                required
              />

              {/* Password Input */}
              <Box>
                <Flex justify="space-between" align="center" mb="8px">
                  <Text fontSize="14px" fontWeight="500" color={uiColors.textPrimary}>
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
                  required
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

              {/* Error message */}
              {error && (
                <Text fontSize="13px" color="red.500">
                  {error}
                </Text>
              )}

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

          {/* Sign Up Link */}
          <Text textAlign="center" fontSize="14px" color={uiColors.textSecondary} mt="24px">
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
