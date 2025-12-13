"use client";

import { GalleryVerticalEnd, type LucideIcon } from "lucide-react";

export function Logo({
    className,
    icon: Icon = GalleryVerticalEnd,
}: {
    className?: string;
    icon?: LucideIcon;
}) {
    return (
        <div className={`flex items-center gap-2 font-medium ${className}`}>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Icon className="size-4" />
            </div>
            Smart HR
        </div>
    );
}
