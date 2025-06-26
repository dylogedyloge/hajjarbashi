import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const SignInSignUpButton = () => {
  const t = useTranslations("Header");
  return (
    <Button
      variant="default"
      size="lg"
      className="cursor-pointer rounded-full px-8 "
    >
      {t("signInSignUp")}
    </Button>
  );
};

export default SignInSignUpButton;
