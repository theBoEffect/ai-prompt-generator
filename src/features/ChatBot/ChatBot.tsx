'use client';

// Features layer - ChatBot feature orchestration

import { useState, useEffect, useRef } from 'react';
import { Message, ProjectRequirements } from '@/data/types';
import { SessionStorage } from '@/data/storage';
import { LLMClient } from '@/domains/llm/client';
import { PromptGenerator } from '@/domains/prompt-generator/generator';
import { ChatMessage } from '@/ui/ChatMessage';
import { ChatInput } from '@/ui/ChatInput';
import { PromptOutput } from '@/ui/PromptOutput';
import { LoadingSpinner } from '@/ui/LoadingSpinner';

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const llmClient = new LLMClient();
  const promptGenerator = new PromptGenerator();

  useEffect(() => {
    const saved = SessionStorage.loadConversation();
    if (saved && saved.messages.length > 0) {
      setMessages(saved.messages);
    } else {
      initializeConversation();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const initializeConversation = async () => {
    const systemPrompt = promptGenerator.generateSystemPrompt();
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: systemPrompt,
      timestamp: Date.now(),
    };

    setIsLoading(true);
    setError(null);

    try {
      const response = await llmClient.sendMessage({
        messages: [{ role: 'system', content: systemPrompt }],
      });

      if (response.error) {
        setError(response.error);
        setIsLoading(false);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
      };

      const newMessages = [systemMessage, assistantMessage];
      setMessages(newMessages);
      SessionStorage.saveConversation({ messages: newMessages, collectedInfo: {} });
    } catch (err) {
      setError('Failed to start conversation. Please check your API configuration.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await llmClient.sendMessage({
        messages: updatedMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (response.error) {
        setError(response.error);
        setIsLoading(false);
        return;
      }

      // Check if LLM called the generate_final_prompt tool
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolCall = response.toolCalls[0];

        if (toolCall.function.name === 'generate_final_prompt') {
          try {
            // Parse the requirements from the tool call
            const requirements: ProjectRequirements = JSON.parse(toolCall.function.arguments);

            // Create an assistant message indicating completion
            const completionMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'Perfect! I have all the information I need. Generating your prompt now...',
              timestamp: Date.now(),
              toolCalls: response.toolCalls,
            };

            const finalMessages = [...updatedMessages, completionMessage];
            setMessages(finalMessages);
            SessionStorage.saveConversation({ messages: finalMessages, collectedInfo: {} });

            // Generate the final prompt using structured data
            const prompt = promptGenerator.generateFinalPrompt(requirements);
            setGeneratedPrompt(prompt);
            setIsComplete(true);
          } catch (parseError) {
            console.error('Failed to parse tool call arguments:', parseError);
            setError('Failed to process requirements. Please try again.');
          }
        }
      } else {
        // Normal message without tool call
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        SessionStorage.saveConversation({ messages: finalMessages, collectedInfo: {} });
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setGeneratedPrompt('');
    setError(null);
    setIsComplete(false);
    SessionStorage.clearConversation();
    initializeConversation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Prompt-o-matic
          </h1>
          <p className="text-gray-600 text-lg">
            AI-powered prompt generator for architecturally sound web apps
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
            <p className="text-red-700 font-medium">Error: {error}</p>
            <p className="text-red-600 text-sm mt-2">
              Make sure you have configured your API key in the .env.local file.
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-2 border-purple-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Chat Interview</h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Reset
            </button>
          </div>

          <div className="h-[500px] overflow-y-auto mb-4 p-4 bg-gray-50 rounded-2xl">
            {messages
              .filter(m => m.role !== 'system')
              .map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
            {isLoading && <LoadingSpinner />}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading || !!error || isComplete}
            placeholder={
              error
                ? 'Please fix the error to continue...'
                : isComplete
                ? 'Interview complete! Click Reset to start over.'
                : 'Type your answer...'
            }
          />
        </div>

        {generatedPrompt && <PromptOutput prompt={generatedPrompt} />}
      </div>
    </div>
  );
}
