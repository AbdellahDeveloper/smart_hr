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
    FormMessage,
} from "@/components/ui/form";
import { signIn, signOut } from "@/lib/auth-client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { loginSchema } from "@/lib/zod/auth.schema";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsPending(true);
        await signIn.email({
            email: values.email,
            password: values.password,
        }, {
            onRequest: () => {
                setIsPending(true);
            },
            onSuccess: async (ctx) => {
                if (ctx.data.user.emailVerified === false) {
                    await signOut(); // Ensure session is cleared for unverified users
                    toast.error("Please verify your email address.");
                    router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
                    setIsPending(false);
                    return;
                }
                toast.success("Logged in successfully");
                router.push("/dashboard");
                router.refresh();
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
                setIsPending(false);
            },
        });
    }

    return (
        <div className="mx-auto space-y-4 sm:w-sm">
            <Logo className="h-5 lg:hidden" />
            <div className="flex flex-col space-y-1">
                <h1 className="font-bold text-2xl tracking-wide">
                    Welcome Back!
                </h1>
                <p className="text-base text-muted-foreground">
                    Login to access your account.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupInput placeholder="email@example.com" type="email" {...field} />
                                        <InputGroupAddon>
                                            <Mail className="size-4" />
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <PasswordInput placeholder="Password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        <LoadingSwap isLoading={isPending}>
                            Login
                        </LoadingSwap>
                    </Button>
                </form>
            </Form>
            <p className="mt-8 text-center text-muted-foreground text-sm">
                Don't have an account?{" "}
                <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary">
                    Register
                </Link>
            </p>
        </div>
    );
}
