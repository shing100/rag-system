import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme;
            return savedTheme || 'system';
        }
        return 'system';
    });

    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            if (theme === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            return theme === 'dark';
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

            if (systemTheme === 'dark') {
                root.classList.add('dark');
                setIsDarkMode(true);
            } else {
                root.classList.remove('dark');
                setIsDarkMode(false);
            }
        } else {
            if (theme === 'dark') {
                root.classList.add('dark');
                setIsDarkMode(true);
            } else {
                root.classList.remove('dark');
                setIsDarkMode(false);
            }
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => {
            if (prevTheme === 'light') return 'dark';
            if (prevTheme === 'dark') return 'system';
            return 'light';
        });
    };

    return { theme, isDarkMode, toggleTheme };
}