"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "./ui/button";

export default function SignInButton() {
    const { data: session } = useSession();

    return (
        session ?
            <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">Dashboard</Button>
            </Link>
            :
            <Link href="/auth" className="w-full">
                <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
    );
}