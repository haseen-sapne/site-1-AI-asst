"use client";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { ChallanCard } from "@/components/widgets/ChallanCard";
import { Loader2, Send, Bot, User, AlertCircle } from "lucide-react";

export default function ChatPage() {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({ parts: [{ type: 'text', text }] } as any);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-white shadow-sm flex-shrink-0">
        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-slate-900 text-sm">JanSeva AI</h1>
          <p className="text-xs text-green-500 font-medium">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-start max-w-[85%]">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm text-slate-700 leading-relaxed">
                Welcome to <strong>JanSeva AI</strong> — your official Indian public service gateway.
                I can help you check traffic fines and e-Challans.{' '}
                Try asking: <em>&quot;Check traffic fines for DL01AB1234&quot;</em>
              </div>
            </div>
          </div>
        )}

        {messages.map((m: any) => {
          const hasVisibleContent = m.parts?.some((p: any) =>
            (p.type === 'text' && p.text?.trim()) ||
            p.type === 'tool-checkTrafficFines' ||
            p.type === 'dynamic-tool' ||
            p.type.startsWith('tool-')
          );

          // Avoid rendering ghost bubbles if there is no text or tool UI present yet
          if (m.role === 'assistant' && !hasVisibleContent && !isLoading) {
            return null;
          }

          return (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 items-start max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  m.role === 'user' ? 'bg-blue-600' : 'bg-blue-100'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-600" />}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm flex flex-col gap-2 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white border text-slate-800 rounded-tl-sm'
                }`}>
                  {/* Render parts according to the AI SDK 7 message structure */}
                  {m.parts?.map((part: any, i: number) => {
                    if (part.type === 'step-start') return null;

                    // Text part
                    if (part.type === 'text') {
                      const textContent = part.text ?? '';
                      if (!textContent) return null;
                      return (
                        <p key={i} className="whitespace-pre-wrap leading-relaxed">
                          {textContent}
                        </p>
                      );
                    }

                    // Tool call part for checkTrafficFines
                    if (part.type === 'tool-checkTrafficFines' || part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
                      const { state } = part;

                      if (state === 'input-streaming' || state === 'input-available') {
                        return (
                          <div key={i} className="flex items-center gap-2 text-slate-500 bg-slate-50 p-3 rounded-xl border">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-xs font-medium">Querying Parivahan database...</span>
                          </div>
                        );
                      }

                      if (state === 'output-available') {
                        return (
                          <div key={i} className="w-full min-w-[280px]">
                            <ChallanCard result={part.output} />
                          </div>
                        );
                      }

                      if (state === 'output-error') {
                        return (
                          <div key={i} className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
                            ⚠ {part.errorText || 'Unable to fetch challan data.'}
                          </div>
                        );
                      }
                    }

                    return null;
                  })}

                  {/* Streaming pulse cursor for assistant message */}
                  {m.role === 'assistant' && isLoading && !hasVisibleContent && (
                    <div className="flex gap-1 items-center h-4 py-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Global error banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl max-w-[85%] mx-auto">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>Connection issue with AI Gateway. Please try again.</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Check traffic fines for DL01AB1234…"
            disabled={isLoading}
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          JanSeva AI provides official public service information only.
        </p>
      </div>
    </div>
  );
}