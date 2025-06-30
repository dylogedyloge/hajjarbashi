import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState, ReactNode } from "react";
import AuthDialog from "./auth-dialog";

interface SignInSignUpButtonProps {
  icon?: ReactNode;
  className?: string;
  variant?: string;
  size?: string;
  labelClassName?: string;
}

const SignInSignUpButton = ({
  icon,
  className = "cursor-pointer rounded-full px-8 ",
  variant = "default",
  size = "lg",
  labelClassName = "",
}: SignInSignUpButtonProps) => {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant as any}
        size={size as any}
        className={className}
        onClick={() => setOpen(true)}
      >
        {icon && <span className="flex flex-col items-center">{icon}</span>}
        <span className={labelClassName}>{t("signInSignUp")}</span>
      </Button>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default SignInSignUpButton;
