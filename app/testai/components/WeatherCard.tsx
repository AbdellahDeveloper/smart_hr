import { Cloud, Calendar, MapPin } from 'lucide-react';

interface WeatherCardProps {
    temp: string;
    city: string;
    day: string;
}

export function WeatherCard({ temp, city, day }: WeatherCardProps) {
    return (
        <div className="block my-3 mx-1 min-w-[280px] max-w-[320px]">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative z-10">
                    {/* City */}
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-white/90" />
                        <h3 className="text-xl font-bold text-white">{city}</h3>
                    </div>

                    {/* Temperature */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start">
                            <span className="text-6xl font-bold text-white">{temp}</span>
                            <span className="text-3xl font-light text-white/90 mt-2">°C</span>
                        </div>
                        <Cloud className="w-16 h-16 text-white/80" />
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/20">
                        <Calendar className="w-4 h-4 text-white/80" />
                        <span className="text-sm text-white/90 font-medium">{day}</span>
                    </div>
                </div>
            </div>
            <br />
        </div>
    );
}
