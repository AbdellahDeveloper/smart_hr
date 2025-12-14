import { Briefcase, MapPin, DollarSign, Users, Clock, Building } from 'lucide-react';

interface JobCardProps {
    position: string;
    company: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    salaryMin?: string;
    salaryMax?: string;
    status?: string;
    applicants?: string;
    postedAt?: string;
}

export function JobCard({
    position,
    company,
    location,
    employmentType,
    workMode,
    salaryMin,
    salaryMax,
    status,
    applicants,
    postedAt
}: JobCardProps) {
    // Determine status styling
    const statusStyles = {
        open: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        closed: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
    };

    const statusStyle = status && statusStyles[status as keyof typeof statusStyles]
        ? statusStyles[status as keyof typeof statusStyles]
        : 'bg-muted text-muted-foreground border-border';

    return (
        <div className="block my-3 mx-1 min-w-[300px] max-w-[380px]">
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Content */}
                <div className="space-y-4">
                    {/* Position Title */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <Briefcase className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{position}</h3>
                    </div>

                    {/* Company */}
                    <div className="flex items-center gap-2 pb-3 border-b">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">{company}</span>
                    </div>

                    {/* Location & Work Mode */}
                    <div className="space-y-2">
                        {location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-foreground">{location}</span>
                            </div>
                        )}
                        {(workMode || employmentType) && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {workMode && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border capitalize">
                                        {workMode}
                                    </span>
                                )}
                                {employmentType && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border capitalize">
                                        {employmentType}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Salary Range */}
                    {(salaryMin || salaryMax) && (
                        <div className="flex items-center gap-2 pb-3 border-b">
                            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground font-medium">
                                {salaryMin && salaryMax ? `$${salaryMin} - $${salaryMax}` : salaryMin ? `$${salaryMin}+` : `Up to $${salaryMax}`}
                            </span>
                        </div>
                    )}

                    {/* Stats */}
                    {(applicants || postedAt) && (
                        <div className="grid grid-cols-2 gap-2">
                            {applicants && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">{applicants} applicants</span>
                                </div>
                            )}
                            {postedAt && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">{postedAt}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Badge */}
                    {status && (
                        <div className="pt-3 border-t">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusStyle}`}>
                                {status}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <br />
        </div>
    );
}
