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
            <div className="flex flex-col items-end mr-2 sm:mr-4 text-slate-600 dark:text-slate-300 w-32 h-10 animate-pulse bg-slate-200 dark:bg-slate-700 rounded">
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end text-slate-600 dark:text-slate-300">
            <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 leading-none">
                {formatTime(currentTime)}
            </div>
            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">
                {formatDate(currentTime)}
            </div>
        </div>
    );
}
