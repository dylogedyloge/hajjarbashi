import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Circle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  authService,
  SignupRequest,
  LoginRequest,
  SendVerificationSmsRequest,
} from "@/lib/auth";
import { PhoneInput } from "@/components/ui/phone-input";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [view, setView] = useState<
    "main" | "email" | "phone" | "google" | "signup" | "reset" | "otp"
  >("main");
  const [phone, setPhone] = useState<string>("");
  const [otpTimer, setOtpTimer] = useState(114);

  // Signup form state
  const [signupData, setSignupData] = useState<SignupRequest>({
    email: "",
    password: "",
  });
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Email signin form state
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });

  // Reset password form state
  const [resetEmail, setResetEmail] = useState<string>("");

  // OTP state for email verification
  const [emailForOtp, setEmailForOtp] = useState<string>("");
  const [otpInputValue, setOtpInputValue] = useState<string>("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // OTP state for phone verification
  const [phoneForOtp, setPhoneForOtp] = useState<string>("");

  const t = useTranslations("AuthDialog");
  const { login } = useAuth();

  // Helper: Validate phone number
  const isValidPhone = (phone: string) => /^\+[1-9]\d{1,14}$/.test(phone);

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setView("main"); // Reset view when dialog closes
      // Reset form data
      setSignupData({ email: "", password: "" });
      setPasswordConfirmation("");
      setSigninData({ email: "", password: "" });
      setResetEmail("");
      setPhone("");
      setEmailForOtp("");
      setOtpInputValue("");
      setError("");
    }
    onOpenChange(open);
  };

  // Handle signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!signupData.email || !signupData.password || !passwordConfirmation) {
      const errorMsg = t("fillAllFields");
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    if (signupData.password !== passwordConfirmation) {
      const errorMsg = t("passwordsDoNotMatch");
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      const errorMsg = t("passwordTooShort");
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.signup(signupData);
      console.log("Signup successful:", response);
      // Store the verification code and email for OTP verification
      setEmailForOtp(signupData.email);
      // Show success message
      toast.success(
        `${t("signupSuccessful")} ${t("verificationCode", {
          code: response.data.code,
        })}`
      );
      // Switch to OTP view for email verification
      setView("otp");
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage =
        err instanceof Error ? err.message : t("signupFailed");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for signup form
  const handleSignupInputChange = (
    field: keyof SignupRequest,
    value: string
  ) => {
    setSignupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle OTP verification
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("OTP SUBMIT", { phoneForOtp, emailForOtp, otpInputValue });

    if (!otpInputValue) {
      toast.error(t("pleaseEnterOtpCode"));
      return;
    }

    setIsOtpLoading(true);

    try {
      if (emailForOtp) {
        // Email verification
        const verificationData = {
          email: emailForOtp,
          verification_code: otpInputValue,
        };
        const response = await authService.verifyEmail(verificationData);
        // Ensure email is a string for context
        const userData = { ...response.data, email: response.data.email || "" };
        login(userData, response.data.token);
        toast.success(t("emailVerifiedSuccessfully"));
        handleDialogChange(false);
      } else if (phoneForOtp) {
        // Phone verification
        const verificationData = {
          phone: phoneForOtp,
          otp_code: otpInputValue,
        };
        const response = await authService.verifyPhone(verificationData);
        // Ensure email is a string for context
        const userData = { ...response.data, email: response.data.email || "" };
        login(userData, response.data.token);
        toast.success(t("phoneVerifiedSuccessfully"));
        handleDialogChange(false);
      } else {
        toast.error(t("pleaseEnterOtpCode"));
      }
    } catch (err) {
      console.error("OTP verificatio error:", err);
      const errorMessage =
        err instanceof Error ? err.message : t("otpVerificationFailed");
      toast.error(errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!signinData.email || !signinData.password) {
      const errorMsg = t("fillAllFields");
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.login(signinData as LoginRequest);
      login(response.data, response.data.token);
      toast.success(t("loginSuccessful"));
      handleDialogChange(false);
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err instanceof Error ? err.message : t("loginFailed");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone login form submission
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!phone) {
      const errorMsg = t("fillAllFields");
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }
    if (!isValidPhone(phone)) {
      const errorMsg = t("invalidPhone");
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.sendVerificationSms({
        phone,
      } as SendVerificationSmsRequest);
      setPhoneForOtp(phone);
      toast.success(
        `${t("smsSentSuccessfully")} ${t("verificationCode", {
          code: response.data.code,
        })}`
      );
      setView("otp");
    } catch (err) {
      console.error("Send SMS error:", err);
      const errorMessage =
        err instanceof Error ? err.message : t("smsSendFailed");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "otp" && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    if (view !== "otp") {
      setOtpTimer(114);
    }
  }, [view, otpTimer]);

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-sm rounded-2xl p-8">
        {view === "main" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t("welcome")}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-base font-normal"
                onClick={() => setView("phone")}
              >
                <Phone className="text-red-500 w-5 h-5" />
                {t("continueWithPhone")}
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-base font-normal"
                onClick={() => setView("google")}
              >
                <Circle className="text-red-500 w-5 h-5" />
                {t("continueWithGoogle")}
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-base font-normal"
                onClick={() => setView("email")}
              >
                <Mail className="text-blue-500 w-5 h-5" />
                {t("continueWithEmail")}
              </Button>
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">
                Terms of conditions
              </span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "phone" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t("enterPhoneNumber")}
              </DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col items-center gap-6"
              onSubmit={handlePhoneLogin}
            >
              {error && (
                <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
              {/* <div className="flex flex-row w-full gap-2">
                <div className="w-36">
                  <PhoneInput2
                    value={phone}
                    onChange={setPhone}
                    className="w-full"
                    placeholder={t('phonePlaceholder')}
                  />
                </div>
                <div className="flex-1">
                  <PhoneInput2
                    value={phone}
                    onChange={setPhone}
                    className="w-full"
                    placeholder={t('phonePlaceholder')}
                  />
                </div>
              </div> */}
              <PhoneInput
                value={phone}
                onChange={setPhone}
                className="w-full"
                placeholder={t("phonePlaceholder")}
              />
              <div className="flex w-full gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                  onClick={() => setView("main")}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full bg-[#E0522D] hover:bg-[#d34722] text-white text-base h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      {t("sendingSms")}
                    </div>
                  ) : (
                    t("continue")
                  )}
                </Button>
              </div>
            </form>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">
                Terms of conditions
              </span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "google" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t("signInWithGoogle")}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-2">
                {/* Google SVG icon */}
                <svg width="32" height="32" viewBox="0 0 48 48">
                  <g>
                    <path
                      fill="#4285F4"
                      d="M43.611 20.083H42V20H24v8h11.303C34.73 32.364 29.807 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.69 0 5.175.886 7.19 2.367l6.062-6.062C33.527 6.053 28.977 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.045 0 19.824-8.955 19.824-20 0-1.341-.138-2.651-.213-3.917z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.306 14.691l6.571 4.819C14.655 16.104 19.002 13 24 13c2.69 0 5.175.886 7.19 2.367l6.062-6.062C33.527 6.053 28.977 4 24 4c-7.732 0-14.41 4.388-17.694 10.691z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 44c5.607 0 10.305-1.863 13.74-5.064l-6.342-5.207C29.807 36 24 36 24 36c-5.807 0-10.73-3.636-12.303-8.917l-6.571 5.073C9.59 39.612 16.268 44 24 44z"
                    />
                    <path
                      fill="#EA4335"
                      d="M43.611 20.083H42V20H24v8h11.303C34.73 32.364 29.807 36 24 36c-5.807 0-10.73-3.636-12.303-8.917l-6.571 5.073C9.59 39.612 16.268 44 24 44c7.732 0 14.41-4.388 17.694-10.691z"
                    />
                  </g>
                </svg>
              </div>
              <div className="text-lg font-medium text-center">
                {t("loggingInWithGoogle")}
              </div>
              <div className="flex justify-center w-full mt-2">
                {/* Spinner */}
                <svg
                  className="animate-spin h-8 w-8 text-[#E0522D]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full w-12 h-12 p-0 flex items-center justify-center mt-2"
                onClick={() => setView("main")}
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">
                Terms of conditions
              </span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "email" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t("signInWithEmail")}
              </DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              {error && (
                <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
              <div>
                <label className="block mb-1 font-medium">
                  {t("emailAddress")}
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={signinData.email}
                  onChange={(e) =>
                    setSigninData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  {t("password")}
                </label>
                <Input
                  type="password"
                  placeholder=""
                  value={signinData.password}
                  onChange={(e) =>
                    setSigninData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-[#E0522D] hover:bg-[#d34722] text-white text-base h-12 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    {t("signingIn")}
                  </div>
                ) : (
                  t("signIn")
                )}
              </Button>
            </form>
            <div className="flex flex-col items-center gap-1 mt-4 text-base">
              <span>
                {t("dontHaveAccount")}{" "}
                <span
                  className="  underline cursor-pointer"
                  onClick={() => setView("signup")}
                >
                  {t("signUp")}
                </span>
              </span>
              <span>
                {t("forgotPassword")}{" "}
                <span
                  className="  underline cursor-pointer"
                  onClick={() => setView("reset")}
                >
                  {t("resetHere")}
                </span>
              </span>
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">
                Terms of conditions
              </span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="absolute left-4 top-4 p-2 rounded-full hover:bg-accent"
              onClick={() => setView("main")}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </>
        ) : view === "signup" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t("enterPersonalInfo")}
              </DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleSignup}>
              {error && (
                <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
              <div>
                <label className="block mb-1 font-medium">
                  {t("emailAddress")}
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={signupData.email}
                  onChange={(e) =>
                    handleSignupInputChange("email", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  {t("password")}
                </label>
                <Input
                  type="password"
                  value={signupData.password}
                  onChange={(e) =>
                    handleSignupInputChange("password", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  {t("passwordConfirmation")}
                </label>
                <Input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>
              <div className="flex w-full gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                  onClick={() => setView("email")}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full bg-[#E0522D] hover:bg-[#d34722] text-white text-base h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      {t("continue")}
                    </div>
                  ) : (
                    t("continue")
                  )}
                </Button>
              </div>
            </form>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">
                Terms of conditions
              </span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "reset" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t("resetPassword")}
              </DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col items-center gap-6"
              onSubmit={(e) => {
                e.preventDefault(); /* handle reset */
              }}
            >
              <div className="w-full">
                <label className="block mb-1 font-medium">
                  {t("enterYourEmail")}
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex w-full gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                  onClick={() => setView("email")}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full bg-[#E0522D] hover:bg-[#d34722] text-white text-base   h-12"
                >
                  {t("sendResetPasswordLink")}
                </Button>
              </div>
            </form>
            <div className="flex flex-col items-center mt-4">
              <Button
                type="button"
                variant="ghost"
                className="  underline text-base mt-2 p-0 h-auto min-h-0 min-w-0"
                onClick={() => {
                  /* handle resend */
                }}
              >
                {t("resendResetPasswordLink")}
              </Button>
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">
                Terms of conditions
              </span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "otp" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t("enterOtpCode")}
              </DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col items-center gap-6"
              onSubmit={handleOtpVerification}
            >
              <div className="w-full text-center mb-2 font-medium">
                {emailForOtp ? (
                  <div>
                    <div>{t("enter6DigitsCode")}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t("sentToEmail", { email: emailForOtp })}
                    </div>
                  </div>
                ) : (
                  t("enter6DigitsCode")
                )}
              </div>
              <div className="flex justify-center gap-4 mb-2">
                <InputOTP
                  maxLength={6}
                  value={otpInputValue}
                  onChange={setOtpInputValue}
                >
                  <InputOTPGroup className="gap-4">
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 w-12 text-xl text-center border rounded"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex w-full gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                  onClick={() =>
                    emailForOtp ? setView("signup") : setView("phone")
                  }
                  disabled={isOtpLoading}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full bg-[#E0522D] hover:bg-[#d34722] text-white text-base h-12"
                  disabled={isOtpLoading}
                >
                  {isOtpLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      {emailForOtp
                        ? t("verifying")
                        : phoneForOtp
                        ? t("verifyingPhone")
                        : t("signUp")}
                    </div>
                  ) : emailForOtp ? (
                    t("verifyEmail")
                  ) : phoneForOtp ? (
                    t("verifyPhone")
                  ) : (
                    t("signUp")
                  )}
                </Button>
              </div>
            </form>
            <div className="flex flex-col items-center mt-4">
              {otpTimer > 0 ? (
                <span className="underline text-base mt-2">
                  {otpTimer > 0
                    ? t("resendOtpCodeIn", {
                        time: `${Math.floor(otpTimer / 60)}:${(otpTimer % 60)
                          .toString()
                          .padStart(2, "0")}`,
                      })
                    : t("resendOtpCode")}
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="underline text-base mt-2 cursor-pointer p-0 h-auto min-h-0 min-w-0"
                  onClick={() => setOtpTimer(114)}
                >
                  {t("resendOtpCode")}
                </Button>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">
                Terms of conditions
              </span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
