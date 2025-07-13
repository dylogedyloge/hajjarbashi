import { redirect } from "next/navigation";

export default function Default() {
  // Redirect to overview tab when no tab parameter is provided
  redirect("/profile?tab=overview");
  return null;
} 