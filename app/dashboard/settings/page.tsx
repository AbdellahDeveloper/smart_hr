"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

type UserSettings = {
    companyName: string
    firstName: string
    lastName: string
    profilePicture: string
}

export default function SettingsPage() {
    // Form state
    const [formData, setFormData] = React.useState<UserSettings>({
        companyName: "Acme Corp",
        firstName: "John",
        lastName: "Doe",
        profilePicture: ""
    })

    const [originalData, setOriginalData] = React.useState<UserSettings>({
        companyName: "Acme Corp",
        firstName: "John",
        lastName: "Doe",
        profilePicture: ""
    })

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleInputChange = (field: keyof UserSettings, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image file size must be less than 5MB")
                return
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please upload an image file")
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setFormData((prev) => ({ ...prev, profilePicture: result }))
                toast.success("Profile picture updated")
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = () => {
        // Here you would typically send the data to your backend
        setOriginalData(formData)
        toast.success("Settings saved successfully!")
        console.log("Saved data:", formData)
    }

    const handleCancel = () => {
        setFormData(originalData)
        toast.info("Changes discarded")
    }

    const getInitials = () => {
        return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Update your profile and company information
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* Profile Picture */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Profile Picture</h3>
                            <p className="text-sm text-muted-foreground">
                                Update your profile photo
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={formData.profilePicture} alt="Profile" />
                                        <AvatarFallback className="text-lg">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <Camera className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Upload Photo
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Click on the avatar or button to upload a new photo (max 5MB)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Company Name */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Company Name</h3>
                            <p className="text-sm text-muted-foreground">
                                The name of your company or organization
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={formData.companyName}
                                onChange={(e) => handleInputChange("companyName", e.target.value)}
                                placeholder="e.g., Acme Corporation"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter your company's official name
                            </p>
                        </div>
                    </div>
                </div>

                {/* First Name */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">First Name</h3>
                            <p className="text-sm text-muted-foreground">
                                Your given name
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                placeholder="e.g., John"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter your first name
                            </p>
                        </div>
                    </div>
                </div>

                {/* Last Name */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Last Name</h3>
                            <p className="text-sm text-muted-foreground">
                                Your family name
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                placeholder="e.g., Doe"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter your last name
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
