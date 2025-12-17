"use client";

import { GalleryVerticalEnd, type LucideIcon } from "lucide-react";
import Link from "next/link";

export function Logo({
    className,
    icon: Icon = GalleryVerticalEnd,
}: {
    className?: string;
    icon?: LucideIcon;
}) {
    return (
        <Link href="/" className={`flex items-center gap-2 font-medium ${className}`}>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Icon className="size-4" />
            </div>
            Smart HR
        </Link>
    );
}
