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
import { Input } from "@/components/ui/input";
import { signUp } from "@/app/actions/auth";
import { useTransition } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { User, Mail, Lock } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { registerSchema } from "@/lib/zod/auth.schema";

export function RegisterForm() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    function onSubmit(values: z.infer<typeof registerSchema>) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("firstName", values.firstName);
            formData.append("lastName", values.lastName);
            formData.append("email", values.email);
            formData.append("password", values.password);
            formData.append("confirmPassword", values.confirmPassword);

            const res = await signUp(formData);

            if (res.success) {
                toast.success("Account created successfully");
                if (res.url) {
                    router.push(res.url);
                }
            } else {
                toast.error(res.error || "Something went wrong");
            }
        });
    }

    return (
        <div className="mx-auto space-y-4 sm:w-sm">
            <Logo className="h-5 lg:hidden" />
            <div className="flex flex-col space-y-1">
                <h1 className="font-bold text-2xl tracking-wide">
                    Join Smart HR!
                </h1>
                <p className="text-base text-muted-foreground">
                    Create your account to get started.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <InputGroup>
                                            <InputGroupInput placeholder="First Name" {...field} />
                                            <InputGroupAddon>
                                                <User className="size-4" />
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <InputGroup>
                                            <InputGroupInput placeholder="Last Name" {...field} />
                                            <InputGroupAddon>
                                                <User className="size-4" />
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupInput placeholder="Email" type="email" {...field} />
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
                                    <PasswordInput {...field} placeholder="Password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <PasswordInput {...field} placeholder="Confirm Password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        <LoadingSwap isLoading={isPending}>
                            Register
                        </LoadingSwap>
                    </Button>
                </form>
            </Form>

            <p className="mt-8 text-center text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link href="/auth" className="underline underline-offset-4 hover:text-primary">
                    Login
                </Link>
            </p>
        </div>
    );
}
