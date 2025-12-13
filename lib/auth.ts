import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/app/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { emailOTP } from "better-auth/plugins";
import nodemailer from "nodemailer";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            firstName: {
                type: "string",
                required: false,
            },
            lastName: {
                type: "string",
                required: false,
            },
        },
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
                    console.error("Missing email env vars");
                    throw new Error("Missing email configuration: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS must be defined env vars");
                }

                const port = parseInt(process.env.MAIL_PORT);
                const secure = port === 465;

                const transporter = nodemailer.createTransport({
                    host: process.env.MAIL_HOST,
                    port: port,
                    secure: secure,
                    auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASS,
                    },
                    logger: true,
                    debug: true,
                });

                try {
                    await transporter.sendMail({
                        from: process.env.MAIL_USER,
                        to: email,
                        subject: "Your Verification Code",
                        text: `Your verification code is ${otp}`,
                    });
                    console.log("Successfully sent OTP to", email);
                } catch (error) {
                    console.error("Failed to send OTP email:", error);
                    // Re-throw so the auth flow knows it failed
                    throw error;
                }
            },
        }),
    ],
});
