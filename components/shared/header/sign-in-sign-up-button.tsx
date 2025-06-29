import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import AuthDialog from "./auth-dialog";

const SignInSignUpButton = () => {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="default"
        size="lg"
        className="cursor-pointer rounded-full px-8 "
        onClick={() => setOpen(true)}
      >
        {t("signInSignUp")}
      </Button>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default SignInSignUpButton;
