
import React from 'react';
import type { ChatMessage } from '../types';

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        You
    </div>
);

const ModelIcon = () => (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        AI
    </div>
);

export const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';

    return (
        <div className={`flex items-start gap-3 my-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
            {isModel && <ModelIcon />}
            <div className={`max-w-xl p-4 rounded-xl shadow-md ${isModel
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                : 'bg-indigo-500 dark:bg-indigo-600 text-white rounded-br-none'
                }`}>
                {message.content}
            </div>
            {!isModel && <UserIcon />}
        </div>
    );
};
