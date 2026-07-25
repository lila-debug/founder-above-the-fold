import { redirect } from "next/navigation";

export const metadata = { title: "Public Demo · Founder Above the Fold" };

export default function LoginPage() {
  redirect("/try");
}
