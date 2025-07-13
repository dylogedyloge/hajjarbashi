import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to overview route
  redirect("/profile/overview");
  return null;
}
