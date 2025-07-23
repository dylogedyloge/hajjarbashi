"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { 
  Phone, 
  Lock, 
  Palette,  
  Link, 
  Eye, 
  EyeOff,
  Edit3,
  Check,
  X,
  Sun,
  Moon,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter as useIntlRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { GB, IR } from "country-flag-icons/react/3x2";
import { deleteAccount } from "@/lib/profile";
import { upsertPhoneRequest, authService } from '@/lib/auth';
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputOTP } from '@/components/ui/input-otp';

// Helper for OTP slot rendering
const renderOtpSlots = ({ slots }: { slots: any[] }) => (
  <div className="flex gap-2 w-full">
    {slots.map((slot, idx) => (
      <div
        key={idx}
        className="w-10 h-14 text-2xl flex items-center justify-center border rounded-md bg-background relative"
        data-active={slot.isActive}
      >
        {slot.char ?? slot.placeholderChar}
        {slot.hasFakeCaret && (
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
            <div className="w-px h-8 bg-primary" />
          </div>
        )}
      </div>
    ))}
  </div>
);

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const { setTheme, resolvedTheme } = useTheme();
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "en";
  const [language, setLanguage] = useState(currentLocale.toUpperCase());
  const [mounted, setMounted] = useState(false);
  const { token, logout, user } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);

  // Hardcoded data for now
  const [formData, setFormData] = useState({
    phone: "+1 (555) 123-4567",
    email: "user@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [linkedAccounts] = useState([
    { provider: "Google", email: "user@gmail.com", connected: true },
    { provider: "Facebook", email: "user@facebook.com", connected: true },
    { provider: "Apple", email: "user@apple.com", connected: false },
  ]);

  // Update language state when locale changes
  useEffect(() => {
    setLanguage(currentLocale.toUpperCase());
  }, [currentLocale]);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    const locale = newLanguage.toLowerCase();
    intlRouter.replace(pathname, { locale });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePhone = async () => {
    setIsEditingPhone(false);
    try {
      if (!token) throw new Error('Authentication required');
      const res = await upsertPhoneRequest({ newPhone: formData.phone, lang: currentLocale, token });
      toast.success(`OTP code: ${res.data}`);
      setOtpSent(true);
      setOtpValue('');
      setIsOtpDialogOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update phone number');
    }
  };

  const handleVerifyPhone = async () => {
    setVerifyingOtp(true);
    try {
      if (!token) throw new Error('Authentication required');
      const res = await authService.verifyPhone({ phone: formData.phone, otp_code: otpValue }, currentLocale);
      toast.success(res.message || 'Phone number verified!');
      setOtpSent(false);
      setOtpValue('');
      setIsOtpDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify phone number');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSaveEmail = () => {
    setIsEditingEmail(false);
    // Here you would typically save to backend
  };

  const handleSavePassword = () => {
    if (formData.newPassword === formData.confirmPassword) {
      setIsEditingPassword(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      // Here you would typically save to backend
    }
  };

  const handleCancelEdit = (type: 'phone' | 'email' | 'password') => {
    if (type === 'phone') setIsEditingPhone(false);
    if (type === 'email') setIsEditingEmail(false);
    if (type === 'password') {
      setIsEditingPassword(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (confirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    try {
      setIsDeletingAccount(true);
      await deleteAccount({
        locale: currentLocale,
        token,
      });
      
      toast.success("Account deleted successfully");
      logout(); // Logout the user after successful deletion
      intlRouter.replace("/"); // Redirect to home page
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteDialogOpen(false);
      setConfirmText("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t("contactInformation.title")}
            </CardTitle>
            <CardDescription>
              {t("contactInformation.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t("contactInformation.phoneNumber")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditingPhone || otpSent}
                  className="flex-1"
                  placeholder={user?.phone || ''}
                />
                {!isEditingPhone ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPhone(true)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSavePhone}
                      disabled={otpSent}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelEdit('phone')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {/* OTP Verification Dialog */}
              <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enter OTP</DialogTitle>
                    <DialogDescription>
                      Please enter the 6-digit code sent to your new phone number.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-2 mt-2">
                    <InputOTP
                      value={otpValue}
                      onChange={setOtpValue}
                      maxLength={5}
                      containerClassName="gap-2"
                      render={renderOtpSlots}
                    />
                  </div>
                  <DialogFooter className="gap-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsOtpDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerifyPhone}
                      disabled={verifyingOtp || otpValue.length !== 5}
                    >
                      {verifyingOtp ? 'Verifying...' : 'Verify'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("contactInformation.emailAddress")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditingEmail}
                  className="flex-1"
                />
                {!isEditingEmail ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingEmail(true)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveEmail}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelEdit('email')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t("password.title")}
            </CardTitle>
            <CardDescription>
              {t("password.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditingPassword ? (
              <Button
                variant="outline"
                onClick={() => setIsEditingPassword(true)}
              >
                {t("password.changePassword")}
              </Button>
            ) : (
                              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("password.currentPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder={t("password.currentPasswordPlaceholder")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("password.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder={t("password.newPasswordPlaceholder")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("password.confirmPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder={t("password.confirmPasswordPlaceholder")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSavePassword}>
                    {t("password.savePassword")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCancelEdit('password')}
                  >
                    {t("password.cancel")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t("preferences.title")}
            </CardTitle>
            <CardDescription>
              {t("preferences.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">{t("preferences.theme")}</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {resolvedTheme === "dark" ? t("preferences.dark") : t("preferences.light")}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Toggle theme"
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="rounded-full"
                  >
                    {resolvedTheme === "dark" ? (
                      <Sun className="size-5" />
                    ) : (
                      <Moon className="size-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">{t("preferences.language")}</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {language === "EN" ? (
                        <>
                          <GB className="w-4 h-4" />
                          {t("preferences.english")}
                        </>
                      ) : (
                        <>
                          <IR className="w-4 h-4" />
                          {t("preferences.persian")}
                        </>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">
                    <div className="flex items-center gap-2">
                      <GB className="w-4 h-4" />
                      {t("preferences.english")}
                    </div>
                  </SelectItem>
                  <SelectItem value="FA">
                    <div className="flex items-center gap-2">
                      <IR className="w-4 h-4" />
                      {t("preferences.persian")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Linked Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              {t("linkedAccounts.title")}
            </CardTitle>
            <CardDescription>
              {t("linkedAccounts.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {linkedAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{account.provider}</span>
                      <span className="text-sm text-muted-foreground">{account.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={account.connected ? "default" : "secondary"}>
                      {account.connected ? t("linkedAccounts.connected") : t("linkedAccounts.notConnected")}
                    </Badge>
                    <Button
                      variant={account.connected ? "destructive" : "default"}
                      size="sm"
                    >
                      {account.connected ? t("linkedAccounts.disconnect") : t("linkedAccounts.connect")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {t("deleteAccount.title")}
            </CardTitle>
            <CardDescription className="text-destructive/80">
              {t("deleteAccount.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    {t("deleteAccount.warning")}
                  </p>
                  <ul className="text-sm text-destructive/80 space-y-1">
                    <li>• {t("deleteAccount.warning1")}</li>
                    <li>• {t("deleteAccount.warning2")}</li>
                    <li>• {t("deleteAccount.warning3")}</li>
                  </ul>
                </div>
              </div>
              
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("deleteAccount.deleteButton")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      {t("deleteAccount.confirmTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-destructive/80">
                      {t("deleteAccount.confirmDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive/90">
                        {t("deleteAccount.confirmWarning")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmText" className="text-sm font-medium">
                        {t("deleteAccount.confirmLabel")}
                      </Label>
                      <Input
                        id="confirmText"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={t("deleteAccount.confirmPlaceholder")}
                        className="border-destructive/20 focus:border-destructive"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsDeleteDialogOpen(false);
                        setConfirmText("");
                      }}
                    >
                      {t("deleteAccount.cancel")}
                    </Button>
                    <Button 
                      variant="destructive" 
                      disabled={confirmText !== "DELETE" || isDeletingAccount}
                      onClick={handleDeleteAccount}
                    >
                      {isDeletingAccount ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {t("deleteAccount.deleting")}
                        </>
                      ) : (
                        t("deleteAccount.confirmDelete")
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 