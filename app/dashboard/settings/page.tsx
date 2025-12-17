"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { getSettings, updateSettings, type UserSettings } from "@/lib/actions/settings"
import { uploadProfilePicture } from "@/lib/actions/upload"
import { useSession } from "@/lib/auth-client"

export default function SettingsPage() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [originalSettings, setOriginalSettings] = React.useState<UserSettings | null>(null)
    const [pendingFile, setPendingFile] = React.useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string>("")
    const [settings, setSettings] = React.useState<UserSettings>({
        companyName: "",
        firstName: "",
        lastName: "",
        profilePicture: "",
    })

    // Fetch settings
    React.useEffect(() => {
        async function fetchSettings() {
            if (!session?.user?.id) return

            try {
                const data = await getSettings(session.user.id)
                if (data) {
                    const settingsData: UserSettings = {
                        companyName: data.companyName || "",
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        profilePicture: data.profilePicture || "",
                    }
                    setSettings(settingsData)
                    setOriginalSettings(settingsData)
                }
            } catch (error) {
                toast.error("Failed to load settings")
            } finally {
                setIsLoading(false)
            }
        }
        fetchSettings()
    }, [session?.user?.id])

    const handleInputChange = (field: keyof UserSettings, value: string) => {
        setSettings((prev) => ({ ...prev, [field]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
            if (!allowedTypes.includes(file.type)) {
                toast.error("Only PNG, JPG, JPEG, and SVG images are allowed")
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB")
                return
            }

            // Store the file for upload on save
            setPendingFile(file)

            // Create a preview URL for instant feedback
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        if (!session?.user?.id) {
            toast.error("You must be logged in to save settings")
            return
        }

        setIsSaving(true)
        try {
            let profilePictureUrl = settings.profilePicture

            // Upload new profile picture to S3 if there's a pending file
            if (pendingFile) {
                const formData = new FormData()
                formData.append("file", pendingFile)

                const uploadResult = await uploadProfilePicture(formData, session.user.id)

                if (!uploadResult.success) {
                    toast.error(uploadResult.error || "Failed to upload image")
                    setIsSaving(false)
                    return
                }

                profilePictureUrl = uploadResult.url || null
            }

            await updateSettings(session.user.id, {
                companyName: settings.companyName || undefined,
                firstName: settings.firstName || undefined,
                lastName: settings.lastName || undefined,
                profilePicture: profilePictureUrl || undefined,
            })

            // Update local state with new URL
            const updatedSettings = { ...settings, profilePicture: profilePictureUrl }
            setSettings(updatedSettings)
            setOriginalSettings(updatedSettings)
            setPendingFile(null)
            setPreviewUrl("")
            toast.success("Settings saved successfully!")
        } catch (error) {
            toast.error("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        if (originalSettings) {
            setSettings(originalSettings)
        }
        setPendingFile(null)
        setPreviewUrl("")
        toast.info("Changes discarded")
    }

    const getInitials = () => {
        const first = settings.firstName?.[0] || ""
        const last = settings.lastName?.[0] || ""
        return (first + last).toUpperCase() || "U"
    }

    if (isLoading) {
        return (
            <div className="min-h-screen pb-12">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                    <div className="max-w-5xl mx-auto px-6 py-4">
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Loading settings...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your profile and preferences
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
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
                                Your profile photo
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={previewUrl || settings.profilePicture || ""} alt="Profile" />
                                    <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity"
                                >
                                    <Camera className="h-6 w-6 text-white" />
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Click on the avatar to upload a new photo
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Name */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Company Name</h3>
                            <p className="text-sm text-muted-foreground">
                                Your company or organization name
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={settings.companyName || ""}
                                onChange={(e) => handleInputChange("companyName", e.target.value)}
                                placeholder="e.g., Acme Corporation"
                            />
                            <p className="text-xs text-muted-foreground">
                                This will be displayed on your job postings
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
                                Your first name
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={settings.firstName || ""}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                placeholder="e.g., John"
                            />
                        </div>
                    </div>
                </div>

                {/* Last Name */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Last Name</h3>
                            <p className="text-sm text-muted-foreground">
                                Your last name
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={settings.lastName || ""}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                placeholder="e.g., Doe"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
