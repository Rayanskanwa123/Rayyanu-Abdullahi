
import React from 'react';
import type { CareerAdviceResponse } from '../types';

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

export const RecommendationDisplay: React.FC<{ data: CareerAdviceResponse }> = ({ data }) => {
    return (
        <div className="space-y-8 text-left">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Recommended Career Paths
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.careerPaths.map((path, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{path.title}</h3>
                            <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">{path.description}</p>
                            <div className="mt-3">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Suggested Courses:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-1">
                                    {path.courses.map((course, i) => <li key={i}>{course}</li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Suggested Universities
                </h2>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">University</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.universities.map((uni, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{uni.name}</th>
                                    <td className="px-6 py-4">{uni.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            uni.type === 'Federal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            uni.type === 'State' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                        }`}>{uni.type}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    A Word of Motivation
                </h2>
                <div className="bg-yellow-50 dark:bg-gray-800 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-gray-700 dark:text-gray-300 italic">
                        <SparklesIcon /> {data.motivation}
                    </p>
                </div>
            </div>

             <div className="text-center pt-4">
                <p className="text-gray-600 dark:text-gray-400">You can now ask me any follow-up questions!</p>
            </div>
        </div>
    );
};
