import { Card } from '@/components/ui/card';
import { Cloud, CloudRain, Snowflake, Sun, Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherCardProps {
    city: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    conditions: string;
}

// Map weather conditions to gradient colors and icons
const getWeatherStyle = (conditions: string) => {
    const lowerConditions = conditions.toLowerCase();

    if (lowerConditions.includes('clear') || lowerConditions.includes('sunny')) {
        return {
            gradient: 'from-amber-400 via-orange-500 to-pink-500',
            icon: <Sun className="w-12 h-12 text-white" />,
            emoji: '☀️'
        };
    } else if (lowerConditions.includes('cloud') || lowerConditions.includes('overcast')) {
        return {
            gradient: 'from-slate-400 via-gray-500 to-slate-600',
            icon: <Cloud className="w-12 h-12 text-white" />,
            emoji: '☁️'
        };
    } else if (lowerConditions.includes('rain') || lowerConditions.includes('drizzle')) {
        return {
            gradient: 'from-blue-500 via-indigo-600 to-blue-700',
            icon: <CloudRain className="w-12 h-12 text-white" />,
            emoji: '🌧️'
        };
    } else if (lowerConditions.includes('snow')) {
        return {
            gradient: 'from-cyan-400 via-blue-300 to-indigo-400',
            icon: <Snowflake className="w-12 h-12 text-white" />,
            emoji: '❄️'
        };
    } else if (lowerConditions.includes('thunder') || lowerConditions.includes('storm')) {
        return {
            gradient: 'from-purple-600 via-violet-700 to-indigo-800',
            icon: <Cloud className="w-12 h-12 text-white" />,
            emoji: '⛈️'
        };
    } else if (lowerConditions.includes('fog')) {
        return {
            gradient: 'from-gray-400 via-slate-500 to-gray-600',
            icon: <Cloud className="w-12 h-12 text-white opacity-70" />,
            emoji: '🌫️'
        };
    } else {
        return {
            gradient: 'from-sky-400 via-blue-500 to-indigo-600',
            icon: <Sun className="w-12 h-12 text-white" />,
            emoji: '🌤️'
        };
    }
};

export function WeatherCard({ city, temperature, feelsLike, humidity, windSpeed, conditions }: WeatherCardProps) {
    const style = getWeatherStyle(conditions);

    return (
        <Card className={`
            relative overflow-hidden border-0 shadow-lg 
            bg-gradient-to-br ${style.gradient}
            text-white min-w-[280px] max-w-[320px]
            hover:shadow-2xl hover:scale-105 transition-all duration-300
        `}>
            <div className="p-6 relative z-10">
                {/* City and Icon */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-bold">{city}</h3>
                        <p className="text-white/80 text-sm mt-1">{conditions}</p>
                    </div>
                    <div className="flex-shrink-0">
                        {style.icon}
                    </div>
                </div>

                {/* Temperature */}
                <div className="mb-6">
                    <div className="flex items-start">
                        <span className="text-6xl font-bold">{Math.round(temperature)}</span>
                        <span className="text-3xl font-light mt-2">°C</span>
                    </div>
                    <p className="text-white/80 text-sm mt-2 flex items-center gap-1">
                        <Thermometer className="w-4 h-4" />
                        Feels like {Math.round(feelsLike)}°C
                    </p>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-white/90" />
                        <div>
                            <p className="text-xs text-white/70">Humidity</p>
                            <p className="text-lg font-semibold">{Math.round(humidity)}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-white/90" />
                        <div>
                            <p className="text-xs text-white/70">Wind</p>
                            <p className="text-lg font-semibold">{Math.round(windSpeed)} km/h</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </Card>
    );
}
