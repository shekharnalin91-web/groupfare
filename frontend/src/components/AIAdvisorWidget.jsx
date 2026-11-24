import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, CornerDownLeft, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AIAdvisorWidget({ currentGroupId = null, onSelectGroup = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I am **GroupFare AI**, your travel coordination assistant. Ask me anything about finding compatible co-passengers, how group flight fares work, or why a group was matched!",
      suggested_prompts: [
        "Why was this group recommended?",
        "What happens if target is not reached?",
        "Find groups from Bengaluru to Delhi",
        "How do group fares save money?"
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText = null) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.ai.chat({
        message: text,
        user_id: currentUser?.id,
        current_group_id: currentGroupId,
        history: messages.slice(-4),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          suggested_prompts: response.suggested_prompts || [],
          used_tools: response.used_tools || [],
          action_type: response.action_type,
          action_data: response.action_data,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having a brief issue accessing live group data. Please try again or explore active groups directly from the directory.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-blue-400/30"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-spin-slow" />
          </div>
          <span className="text-sm">GroupFare AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[440px] max-h-[85vh] h-[640px] rounded-3xl glass-panel-glow border border-blue-500/40 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">GroupFare AI</h4>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Live Agent
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Coordinating smart group travel</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-2 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Markdown formatted content */}
                  <div
                    className="prose prose-invert prose-xs max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: m.content
                        .replace(/### (.*?)\n/g, '<strong class="block text-sm text-white font-bold mt-1 mb-1">$1</strong>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-slate-800 rounded text-cyan-300 font-mono text-[10px]">$1</code>')
                        .replace(/\n\n/g, '<br/><br/>')
                        .replace(/\n- /g, '<br/>• ')
                    }}
                  />

                  {/* Tools used pill */}
                  {m.used_tools && m.used_tools.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      <span>Controlled tools: {m.used_tools.join(', ')}</span>
                    </div>
                  )}

                  {/* Action card if group recommended */}
                  {m.action_data?.group_id && (
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 truncate">
                        {m.action_data.group_name || 'Recommended Cohort'}
                      </span>
                      <button
                        onClick={() => {
                          if (onSelectGroup) onSelectGroup(m.action_data.group_id);
                          setIsOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold flex items-center gap-1"
                      >
                        <span>View Group</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Suggested quick prompt chips */}
                  {m.suggested_prompts && m.suggested_prompts.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {m.suggested_prompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSend(prompt)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-[10px] font-medium transition-colors border border-slate-700/60 text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>GroupFare AI is analyzing group constraints...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about travel routes, group sizes, or quotas..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
