"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
    const router = useRouter();

    return (
        <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={async () => {
                await signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            router.push("/");
                            router.refresh();
                        },
                    },
                });
            }}
        >
            Sign Out
        </button>
    );
}
