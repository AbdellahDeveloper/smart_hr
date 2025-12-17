import { signIn, signUp, signOut } from "./actions/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import HeroSection from "@/components/hero-section";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <HeroSection />
    </>
  );
}
