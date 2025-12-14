import { User, Mail, Phone, Briefcase, MapPin, Calendar, FileText } from 'lucide-react';

interface ApplicationCardProps {
    fullName: string;
    email: string;
    phone?: string;
    jobName: string;
    status: string;
    experience?: string;
    location?: string;
    appliedAt?: string;
}

export function ApplicationCard({
    fullName,
    email,
    phone,
    jobName,
    status,
    experience,
    location,
    appliedAt
}: ApplicationCardProps) {
    // Determine status styling
    const statusStyles = {
        pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        accepted: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        rejected: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    };

    const statusStyle = statusStyles[status as keyof typeof statusStyles] || 'bg-muted text-muted-foreground border-border';

    return (
        <div className="block my-3 mx-1 min-w-[300px] max-w-[380px]">
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Content */}
                <div className="space-y-4">
                    {/* Header - Applicant Name */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{fullName}</h3>
                    </div>

                    {/* Job Name */}
                    <div className="flex items-center gap-2 pb-3 border-b">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">{jobName}</span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground truncate">{email}</span>
                        </div>
                        {phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-foreground">{phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Additional Details */}
                    {(experience || location || appliedAt) && (
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                            {experience && (
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">{experience}</span>
                                </div>
                            )}
                            {location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground truncate">{location}</span>
                                </div>
                            )}
                            {appliedAt && (
                                <div className="flex items-center gap-2 col-span-2">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(appliedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="pt-3 border-t">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusStyle}`}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
