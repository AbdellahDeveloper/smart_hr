
import { getSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "./ui/button";

export default async function SignInButton() {
    const session = await getSession();

    return (
        (session && session.data?.user.emailVerified) ?
            <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">Dashboard</Button>
            </Link>
            :
            <Link href="/auth" className="w-full">
                <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
    );
}