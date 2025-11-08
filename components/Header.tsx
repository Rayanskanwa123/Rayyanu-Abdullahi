import React from 'react';

const GraduationCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5 8.28V13.5a1 1 0 001 1h8a1 1 0 001-1V8.28l1.606-1.36a1 1 0 000-1.84l-7-3zM6 9.28L10 11.01l4-1.73V13H6V9.28zM10 4.16L13.394 5.5 10 6.84 6.606 5.5 10 4.16z" />
        <path d="M3 14.5a1.5 1.5 0 011.5-1.5h11A1.5 1.5 0 0117 14.5v1h-14v-1z" />
    </svg>
);

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 dark:bg-gray-900 shadow-md w-full">
            <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center space-x-3">
                <GraduationCapIcon />
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    SmartCareer Advisor
                </h1>
            </div>
        </header>
    );
};