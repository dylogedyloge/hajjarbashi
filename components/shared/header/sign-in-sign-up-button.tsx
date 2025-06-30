import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { useState, ReactNode } from "react";
import AuthDialog from "./auth-dialog";

interface SignInSignUpButtonProps {
  icon?: ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
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
        variant={variant}
        size={size}
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
