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
import { PhoneInput } from "@/components/ui/phone-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useTranslations } from 'next-intl';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [view, setView] = useState<'main' | 'email' | 'phone' | 'google' | 'signup' | 'reset' | 'otp'>("main");
  const [phone, setPhone] = useState<string>("");
  const [otpTimer, setOtpTimer] = useState(114);
  const t = useTranslations('AuthDialog');

  const handleDialogChange = (open: boolean) => {
    if (!open) setView("main"); // Reset view when dialog closes
    onOpenChange(open);
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
                {t('welcome')}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-base font-normal"
                onClick={() => setView("phone")}
              >
                <Phone className="text-red-500 w-5 h-5" />
                {t('continueWithPhone')}
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-base font-normal"
                onClick={() => setView("google")}
              >
                <Circle className="text-red-500 w-5 h-5" />
                {t('continueWithGoogle')}
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-base font-normal"
                onClick={() => setView("email")}
              >
                <Mail className="text-blue-500 w-5 h-5" />
                {t('continueWithEmail')}
              </Button>
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">Terms of conditions</span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "phone" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t('enterPhoneNumber')}
              </DialogTitle>
            </DialogHeader>
            <form className="flex flex-col items-center gap-6" onSubmit={e => { e.preventDefault(); setView('otp'); }}>
              <div className="flex flex-row w-full gap-2">
                <div className="w-36">
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    defaultCountry="MY"
                    className="w-full"
                    international
                    countryCallingCodeEditable={false}
                    // Only show the country select, hide the input
                    inputComponent={() => null}
                  />
                </div>
                <div className="flex-1">
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    defaultCountry="MY"
                    className="w-full"
                    international
                    countrySelectComponent={() => null}
                    placeholder={t('phonePlaceholder')}
                  />
                </div>
              </div>
              <div className="flex w-full gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                  onClick={() => setView("main")}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full bg-[#E0522D] hover:bg-[#d34722] text-white text-base   h-12"
                >
                  {t('continue')}
                </Button>
              </div>
            </form>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">Terms of conditions</span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "google" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t('signInWithGoogle')}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-2">
                {/* Google SVG icon */}
                <svg width="32" height="32" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303C34.73 32.364 29.807 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.69 0 5.175.886 7.19 2.367l6.062-6.062C33.527 6.053 28.977 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.045 0 19.824-8.955 19.824-20 0-1.341-.138-2.651-.213-3.917z"/><path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 16.104 19.002 13 24 13c2.69 0 5.175.886 7.19 2.367l6.062-6.062C33.527 6.053 28.977 4 24 4c-7.732 0-14.41 4.388-17.694 10.691z"/><path fill="#FBBC05" d="M24 44c5.607 0 10.305-1.863 13.74-5.064l-6.342-5.207C29.807 36 24 36 24 36c-5.807 0-10.73-3.636-12.303-8.917l-6.571 5.073C9.59 39.612 16.268 44 24 44z"/><path fill="#EA4335" d="M43.611 20.083H42V20H24v8h11.303C34.73 32.364 29.807 36 24 36c-5.807 0-10.73-3.636-12.303-8.917l-6.571 5.073C9.59 39.612 16.268 44 24 44c7.732 0 14.41-4.388 17.694-10.691z"/></g></svg>
              </div>
              <div className="text-lg font-medium text-center">{t('loggingInWithGoogle')}</div>
              <div className="flex justify-center w-full mt-2">
                {/* Spinner */}
                <svg className="animate-spin h-8 w-8 text-[#E0522D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
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
              <span className="  text-foreground cursor-pointer">Terms of conditions</span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "email" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t('signInWithEmail')}
              </DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 font-medium">{t('emailAddress')}</label>
                <Input type="email" placeholder="email@example.com" required />
              </div>
              <div>
                <label className="block mb-1 font-medium">{t('password')}</label>
                <Input type="password" placeholder="" required />
              </div>
              <Button type="submit" className="w-full rounded-full bg-[#E0522D] hover:bg-[#d34722] text-white text-base   h-12 mt-2">
                {t('signIn')}
              </Button>
            </form>
            <div className="flex flex-col items-center gap-1 mt-4 text-base">
              <span>
                {t('dontHaveAccount')}{' '}
                <span className="  underline cursor-pointer" onClick={() => setView('signup')}>{t('signUp')}</span>
              </span>
              <span>
                {t('forgotPassword')}{' '}
                <span className="  underline cursor-pointer" onClick={() => setView('reset')}>{t('resetHere')}</span>
              </span>
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">Terms of conditions</span>
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
                {t('enterPersonalInfo')}
              </DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 font-medium">{t('emailAddress')}</label>
                <Input type="email" placeholder="email@example.com" required />
              </div>
              <div>
                <label className="block mb-1 font-medium">{t('password')}</label>
                <Input type="password" required />
              </div>
              <div>
                <label className="block mb-1 font-medium">{t('passwordConfirmation')}</label>
                <Input type="password" required />
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
                  {t('continue')}
                </Button>
              </div>
            </form>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">Terms of conditions</span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "reset" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t('resetPassword')}
              </DialogTitle>
            </DialogHeader>
            <form className="flex flex-col items-center gap-6" onSubmit={e => { e.preventDefault(); /* handle reset */ }}>
              <div className="w-full">
                <label className="block mb-1 font-medium">{t('enterYourEmail')}</label>
                <Input type="email" placeholder="email@example.com" required />
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
                  {t('sendResetPasswordLink')}
                </Button>
              </div>
            </form>
            <div className="flex flex-col items-center mt-4">
              <Button
                type="button"
                variant="ghost"
                className="  underline text-base mt-2 p-0 h-auto min-h-0 min-w-0"
                onClick={() => {/* handle resend */}}
              >
                {t('resendResetPasswordLink')}
              </Button>
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">Terms of conditions</span>
              <span className="mx-1">•</span>
              <span className="  text-foreground cursor-pointer">Support</span>
            </div>
          </>
        ) : view === "otp" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold mb-6">
                {t('enterOtpCode')}
              </DialogTitle>
            </DialogHeader>
            <form className="flex flex-col items-center gap-6" onSubmit={e => e.preventDefault()}>
              <div className="w-full text-center mb-2 font-medium">{t('enter6DigitsCode')}</div>
              <div className="flex justify-center gap-4 mb-2">
                <InputOTP maxLength={6}>
                  <InputOTPGroup className="gap-4">
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="h-12 w-12 text-xl text-center border rounded" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex w-full gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                  onClick={() => setView("phone")}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full bg-[#E0522D] hover:bg-[#d34722] text-white text-base   h-12"
                >
                  {t('signUp')}
                </Button>
              </div>
            </form>
            <div className="flex flex-col items-center mt-4">
              {otpTimer > 0 ? (
                <span className="underline text-base mt-2">
                  {otpTimer > 0
                    ? t('resendOtpCodeIn', { time: `${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, "0")}` })
                    : t('resendOtpCode')}
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="underline text-base mt-2 cursor-pointer p-0 h-auto min-h-0 min-w-0"
                  onClick={() => setOtpTimer(114)}
                >
                  {t('resendOtpCode')}
                </Button>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="  text-foreground cursor-pointer">Terms of conditions</span>
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