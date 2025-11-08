import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ConversationStep, UserProfile, ChatMessage, CareerAdviceResponse } from './types';
import { SUBJECT_OPTIONS, INTEREST_OPTIONS, BUDGET_OPTIONS } from './constants';
import { generateRecommendations, startChat } from './services/geminiService';

import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ChatBubble } from './components/ChatBubble';
import { RecommendationDisplay } from './components/RecommendationDisplay';

const OptionSelector: React.FC<{
  title: string;
  options: string[];
  selection: string[];
  onSelect: (option: string) => void;
  isMultiSelect: boolean;
}> = ({ title, options, selection, onSelect, isMultiSelect }) => (
  <div className="text-left w-full">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h2>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selection.includes(option);
        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors duration-200 ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

const ChatInput: React.FC<{ onSendMessage: (text: string) => void; isLoading: boolean }> = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                disabled={isLoading}
                className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors">
                 {isLoading ? (
                    <div className="w-6 h-6"><LoadingSpinner /></div>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                 )}
            </button>
        </form>
    );
};


const App: React.FC = () => {
  const [step, setStep] = useState<ConversationStep>(ConversationStep.GREETING);
  const [userProfile, setUserProfile] = useState<UserProfile>({ subjects: [], interests: [], budget: '' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (step === ConversationStep.GREETING) {
      setMessages([{
        id: Date.now().toString(),
        role: 'model',
        content: "Hello! I'm SmartCareer Advisor, your personal guide to a successful career in Nigeria, designed by Rayyanu Abdullahi. To get started, let's explore your academic strengths. Which subjects are you best at?"
      }]);
      setStep(ConversationStep.SUBJECTS);
    }
  }, [step]);
  
  const handleGetRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStep(ConversationStep.GENERATING);
    setMessages(prev => [...prev, {
        id: 'generating-id',
        role: 'model',
        content: <div className="flex items-center"><LoadingSpinner /> <span className="ml-2">Crafting your personalized recommendations...</span></div>
    }]);

    try {
        const recommendations = await generateRecommendations(userProfile);
        const recommendationComponent = <RecommendationDisplay data={recommendations} />;
        
        setMessages(prev => prev.slice(0, -1)); // Remove loading message
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            content: recommendationComponent
        }]);
        setStep(ConversationStep.CHATTING);
        chatRef.current = startChat();

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        setMessages(prev => prev.slice(0, -1)); // Remove loading message
        setMessages(prev => [...prev, {
            id: 'error-id',
            role: 'model',
            content: <p className="text-red-500">Sorry, I couldn't generate recommendations. {errorMessage}</p>
        }]);
        setStep(ConversationStep.BUDGET); // Go back to allow retry
    } finally {
        setIsLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (step === ConversationStep.GENERATING && userProfile.subjects.length > 0 && userProfile.interests.length > 0 && userProfile.budget) {
        handleGetRecommendations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, userProfile]);

  const handleOptionSelect = (option: string, type: keyof UserProfile) => {
    setUserProfile(prev => {
        if (type === 'subjects' || type === 'interests') {
            const currentValues = prev[type] as string[];
            const newValues = currentValues.includes(option)
                ? currentValues.filter(item => item !== option)
                : [...currentValues, option];
            return { ...prev, [type]: newValues };
        } else {
             return { ...prev, [type]: option };
        }
    });
  };

  const advanceStep = () => {
      let nextStep: ConversationStep | null = null;
      let modelMessage: string | null = null;

      if (step === ConversationStep.SUBJECTS && userProfile.subjects.length > 0) {
          nextStep = ConversationStep.INTERESTS;
          modelMessage = "Great! Now, what are your hobbies and interests outside of school?";
      } else if (step === ConversationStep.INTERESTS && userProfile.interests.length > 0) {
          nextStep = ConversationStep.BUDGET;
          modelMessage = "Excellent. Lastly, what's your estimated budget for university tuition?";
      } else if (step === ConversationStep.BUDGET && userProfile.budget) {
          nextStep = ConversationStep.GENERATING;
          modelMessage = "Thank you! I have all the information I need. Generating your personalized career and university recommendations now.";
      }

      if (nextStep !== null && modelMessage) {
        setMessages(prev => [...prev, {
            id: `model-${Date.now()}`,
            role: 'model',
            content: modelMessage
        }]);
        setStep(nextStep);
      }
  };
  
  const handleFollowUp = async (text: string) => {
    if (!chatRef.current) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, {id: `user-${Date.now()}`, role: 'user', content: text}]);
    
    try {
        const result = await chatRef.current.sendMessage(text);
        const responseText = result.text;
        setMessages(prev => [...prev, {id: `model-${Date.now()}`, role: 'model', content: responseText}]);
    } catch(err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setMessages(prev => [...prev, {id: `error-${Date.now()}`, role: 'model', content: `Sorry, I ran into an error: ${errorMessage}`}]);
    } finally {
        setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case ConversationStep.SUBJECTS:
        return <OptionSelector title="Which subjects are you best at? (Select all that apply)" options={SUBJECT_OPTIONS} selection={userProfile.subjects} onSelect={(opt) => handleOptionSelect(opt, 'subjects')} isMultiSelect={true} />;
      case ConversationStep.INTERESTS:
        return <OptionSelector title="What do you enjoy doing? (Select all that apply)" options={INTEREST_OPTIONS} selection={userProfile.interests} onSelect={(opt) => handleOptionSelect(opt, 'interests')} isMultiSelect={true} />;
      case ConversationStep.BUDGET:
        return <OptionSelector title="What is your financial capacity for university?" options={BUDGET_OPTIONS} selection={[userProfile.budget]} onSelect={(opt) => handleOptionSelect(opt, 'budget')} isMultiSelect={false} />;
      default:
        return null;
    }
  };

  const canAdvance = (): boolean => {
      if (step === ConversationStep.SUBJECTS) return userProfile.subjects.length > 0;
      if (step === ConversationStep.INTERESTS) return userProfile.interests.length > 0;
      if (step === ConversationStep.BUDGET) return !!userProfile.budget;
      return false;
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full bg-gray-100 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-4xl p-4 md:p-6 flex-1">
          <div className="space-y-4">
            {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
          </div>
           {step < ConversationStep.GENERATING && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mt-4 space-y-6 text-center">
                  {renderCurrentStep()}
                  {canAdvance() && (
                      <button 
                          onClick={advanceStep}
                          className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                          Continue
                      </button>
                  )}
              </div>
            )}
           <div ref={messagesEndRef} />
        </div>
      </main>
      {step === ConversationStep.CHATTING && (
        <footer className="w-full max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleFollowUp} isLoading={isLoading} />
        </footer>
      )}
    </div>
  );
};

export default App;