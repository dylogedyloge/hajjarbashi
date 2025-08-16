"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LogOut, 
  Monitor, 
  Globe, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function SignOutPage() {
  const { user, token, logout } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("SignOut");
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [signOutType, setSignOutType] = useState<"this-device" | "all-devices" | null>(null);
  
  const logoutMutation = useLogout();

  // Mock session data (in a real app, this would come from an API)
  const sessionData = {
    lastActive: new Date().toISOString(),
    browser: "Chrome 120.0.0.0",
    location: "Tehran, Iran",
    ipAddress: "192.168.1.100",
    deviceType: "Desktop"
  };

  const handleSignOut = (type: "this-device" | "all-devices") => {
    setSignOutType(type);
    setShowConfirmDialog(true);
  };

  const confirmSignOut = async () => {
    if (!token) {
      toast.error(t("signOutError"));
      return;
    }

    try {
      // Call server-side logout API
      await logoutMutation.mutateAsync({
        token,
        lang: locale
      });

      // Clear local auth state
      logout();
      
      toast.success(t("signOutSuccess"));
      
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if server logout fails, we can still clear local state
      logout();
      toast.success(t("signOutSuccess"));
      router.push("/");
    } finally {
      setShowConfirmDialog(false);
      setSignOutType(null);
    }
  };

  const cancelSignOut = () => {
    setShowConfirmDialog(false);
    setSignOutType(null);
  };

  if (!user || !token) {
    return (
      <div className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Not Signed In</h2>
          <p className="text-muted-foreground">You need to be signed in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Session Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              {t("currentSession")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("currentSessionDescription")}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("sessionInfo")}</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t("lastActive")}:</span>
                  <span className="text-muted-foreground">
                    {new Date(sessionData.lastActive).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t("browser")}:</span>
                  <span className="text-muted-foreground">{sessionData.browser}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t("location")}:</span>
                  <span className="text-muted-foreground">{sessionData.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t("ipAddress")}:</span>
                  <span className="text-muted-foreground">{sessionData.ipAddress}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              {t("signOutOptions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("signOutOptionsDescription")}
            </p>
            
            <div className="space-y-3">
              {/* Sign out from this device */}
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{t("signOutFromThisDevice")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("signOutFromThisDeviceDescription")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => handleSignOut("this-device")}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  {t("signOut")}
                </Button>
              </div>

              {/* Sign out from all devices */}
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{t("signOutFromAllDevices")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("signOutFromAllDevicesDescription")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => handleSignOut("all-devices")}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  {t("signOut")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {t("confirmSignOut")}
            </DialogTitle>
            <DialogDescription>
              {t("confirmSignOutDescription")}
              {signOutType === "all-devices" && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will sign you out from all devices and invalidate all sessions.
                  </AlertDescription>
                </Alert>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelSignOut} disabled={logoutMutation.isPending}>
              {t("cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmSignOut}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t("signingOut")}
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("signOut")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 