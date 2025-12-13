"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyEmail, resendOtp } from "@/app/actions/auth";
import { useTransition, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { verifyEmailSchema } from "@/lib/zod/auth.schema";

export function VerifyEmailForm() {
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const form = useForm<z.infer<typeof verifyEmailSchema>>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            otp: "",
        },
    });

    const router = useRouter();

    function onSubmit(values: z.infer<typeof verifyEmailSchema>) {
        startTransition(async () => {
            if (!email) {
                return;
            }
            const formData = new FormData();
            formData.append("otp", values.otp);
            formData.append("email", email);

            const result = await verifyEmail(formData);

            if (result?.error) {
                toast.error(result.error);
            } else if (result?.success && result.url) {
                toast.success("Email verified successfully");
                router.push(result.url);
            }
        });
    }

    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    async function handleResend() {
        if (!email) return;
        setCanResend(false);
        setTimer(60);

        try {
            const result = await resendOtp(email);
            if (result.success) {
                toast.success("Verification code sent!");
            } else {
                toast.error(result.error);
                setCanResend(true);
                setTimer(0);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to resend code");
            setCanResend(true);
            setTimer(0);
        }
    }

    if (!email) {
        return (
            <div className="mx-auto space-y-4 sm:w-sm text-center">
                <h1 className="font-bold text-2xl tracking-wide text-destructive">Error</h1>
                <p className="text-base text-muted-foreground">Email address not found. Please try signing up or logging in again.</p>
            </div>
        )
    }

    return (
        <div className="mx-auto space-y-4 sm:w-sm">
            <Logo className="h-5 lg:hidden" />
            <div className="flex flex-col space-y-1">
                <h1 className="font-bold text-2xl tracking-wide">
                    Verify Email
                </h1>
                <p className="text-base text-muted-foreground">
                    Enter the code sent to {email}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col items-center">
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">OTP</FormLabel>
                                <FormControl>
                                    <InputOTP maxLength={6} {...field}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        <LoadingSwap isLoading={isPending}>
                            Verify
                        </LoadingSwap>
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm">
                {canResend ? (
                    <Button
                        variant="link"
                        onClick={handleResend}
                        className="p-0 h-auto font-normal text-primary hover:no-underline"
                    >
                        Resend code
                    </Button>
                ) : (
                    <span className="text-muted-foreground">
                        Resend code in {timer}s
                    </span>
                )}
            </div>
        </div>
    );
}
