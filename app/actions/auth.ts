"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { registerSchema, loginSchema, verifyEmailSchema } from "@/lib/zod/auth.schema";

export async function signUp(formData: FormData) {
    const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = registerSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const { firstName, lastName, email, password } = parsed.data;

    try {
        await auth.api.signUpEmail({
            body: {
                name: `${firstName} ${lastName}`.trim(),
                email,
                password,
                firstName,
                lastName,
            },
        });
        await resendOtp(email);
        return { success: true, url: `/auth/verify-email?email=${encodeURIComponent(email)}` };
    } catch (error: any) {
        if (error.body?.message) {
            return { success: false, error: error.body.message };
        }
        if (error.message) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Something went wrong during sign up" };
    }
}

export async function signIn(formData: FormData) {
    const rawData = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const { email, password } = parsed.data;

    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            },
        });

        // Check if user is verified
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (session && !session.user.emailVerified) {
            await resendOtp(email);
            return {
                success: false,
                error: "Please verify your email address.",
                url: `/auth/verify-email?email=${encodeURIComponent(email)}`
            };
        }

        return { success: true, url: "/dashboard" };
    } catch (error: any) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }

        const errorMessage = error.body?.message || error.message || "Invalid email or password";

        // If the error suggests unverified email, provide the redirect URL
        if (errorMessage.toLowerCase().includes("verify")) {
            await resendOtp(email);
            return {
                success: false,
                error: errorMessage,
                url: `/auth/verify-email?email=${encodeURIComponent(email)}`
            };
        }

        return { success: false, error: errorMessage };
    }
}

export async function signOut() {
    await auth.api.signOut({
        headers: await headers(),
    });
    redirect("/");
}

export async function verifyEmail(formData: FormData) {
    const rawData = {
        email: formData.get("email"),
        otp: formData.get("otp"),
    };

    const parsed = verifyEmailSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const { otp } = parsed.data;
    // email is optional in schema but required for the API call here
    // rawData.email comes from formData so it is string or null
    const email = rawData.email as string;

    if (!email) {
        return { success: false, error: "Email is required" };
    }

    try {
        await auth.api.verifyEmailOTP({
            body: {
                email,
                otp
            }
        });
        return { success: true, url: "/dashboard" };
    } catch (error) {
        return { success: false, error: "Invalid OTP code" };
    }
}
export async function resendOtp(email: string) {
    try {
        await auth.api.sendVerificationOTP({
            body: {
                email,
                type: "email-verification"
            }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to resend OTP" };
    }
}
