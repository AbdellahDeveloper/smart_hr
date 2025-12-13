import { Suspense } from "react";
import { VerifyEmailForm } from "@/app/auth/_components/verify-email-form";

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="mx-auto space-y-4 sm:w-sm text-center">Loading...</div>}>
            <VerifyEmailForm />
        </Suspense>
    );
}
