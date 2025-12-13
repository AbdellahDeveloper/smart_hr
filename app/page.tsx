import { signIn, signUp, signOut } from "./actions/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <h1 className="text-4xl font-bold">Smart HR | ROUTES:</h1>
      <span className="text-4xl font-bold">/auth</span>
      <span className="text-4xl font-bold">/dashboard</span>
      <span className="text-4xl font-bold">/dashboard/jobs</span>
      <span className="text-4xl font-bold">/dashboard/applications</span>
    </div>
  );
}
