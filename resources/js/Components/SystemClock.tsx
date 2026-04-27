import { useState, useEffect } from 'react';

export default function SystemClock() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (!currentTime) {
        return (
            <div className="hidden sm:flex flex-col items-end mr-4 text-slate-600 dark:text-slate-300 w-32 h-10 animate-pulse bg-slate-200 dark:bg-slate-700 rounded">
            </div>
        );
    }

    return (
        <div className="hidden sm:flex flex-col items-end mr-4 text-slate-600 dark:text-slate-300">
            <div className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                {formatTime(currentTime)}
            </div>
            <div className="text-xs font-medium opacity-80">
                {formatDate(currentTime)}
            </div>
        </div>
    );
}
