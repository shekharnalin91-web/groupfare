import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, User, ShieldCheck, ArrowRight, RefreshCw, Plane, HelpCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AIAssistantPage({ setActivePage, setSelectedGroupId }) {
  const { currentUser } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `### Welcome to **GroupFare AI Travel Assistant**! ✈️\n\nI am your specialized AI agent designed by team **CORRUPTX** to assist with discovering fellow passengers, understanding volume airline quotas, and transparent group flight booking.\n\nHere are a few multi-step tasks I can perform for you:`,
      suggested_prompts: [
        "Find groups from Bengaluru to Delhi",
        "Why was this group recommended?",
        "What happens if target is not reached?",
        "How do group flight fares work?",
        "Explain the 5-factor matching formula"
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend = null) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.ai.chat({
        message: text,
        user_id: currentUser?.id,
        history: messages.slice(-5)
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          suggested_prompts: response.suggested_prompts || [],
          used_tools: response.used_tools || [],
          action_type: response.action_type,
          action_data: response.action_data
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I encountered an issue accessing the live database. Please try again shortly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">GroupFare AI Assistant</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                Autonomous Travel Agent
              </span>
            </div>
            <p className="text-xs text-slate-400">Powered by controlled tools & verified backend data</p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto rounded-3xl glass-panel border border-slate-800 p-6 space-y-6">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-3xl p-5 text-sm leading-relaxed space-y-3 ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}
            >
              {/* Markdown Content */}
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: m.content
                    .replace(/### (.*?)\n/g, '<strong class="block text-base text-white font-bold mt-1 mb-2">$1</strong>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300 font-mono text-xs">$1</code>')
                    .replace(/\n\n/g, '<br/><br/>')
                    .replace(/\n- /g, '<br/>• ')
                }}
              />

              {/* Tools Executed badge */}
              {m.used_tools && m.used_tools.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Agent tools called: {m.used_tools.join(', ')}</span>
                </div>
              )}

              {/* Action buttons if assistant discovered groups */}
              {m.action_data?.group_id && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">
                    {m.action_data.group_name || 'Recommended Cohort'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedGroupId(m.action_data.group_id);
                      setActivePage('details');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Inspect Group</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Suggested Prompts */}
              {m.suggested_prompts && m.suggested_prompts.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                  {m.suggested_prompts.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSend(p)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-medium transition-colors border border-slate-700/60 text-left"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>GroupFare AI is searching flight clusters and evaluating quota constraints...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 rounded-2xl glass-panel border border-slate-800 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about group flight fares, quota rules, or route dates..."
          className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-500 px-3"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
