import { useState } from "react";
import { UserCircle, Send, AirlineSeatReclineNormal, LogOut, ChevronRight, Menu, X } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "./lib/utils";

export default function App() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [messages, setMessages] = useState<Record<number, { role: "user" | "agent"; text: string }[]>>({
    0: [{ role: "agent", text: "Hello Priya. I see your flight SK-204 from Delhi to Goa has been cancelled due to operational reasons. I sincerely apologize for this disruption. How can I assist you today?" }],
    1: [{ role: "agent", text: "Hello Arvind. I apologize for the disruption. I see your flight SK-118 from Mumbai to Bengaluru is currently delayed by 4 hours. How can I assist you with this?" }],
    2: [{ role: "agent", text: "Hello Meher. I apologize for the disruption today. I see your flight SK-305 from Delhi to Hyderabad is delayed by 6 hours. How can I assist you?" }]
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scenarios = [
    {
      id: 0,
      name: "Priya Nair",
      tier: "Gold",
      pnr: "SK4821X",
      flight: "SK-204 (Delhi → Goa)",
      status: "Cancelled",
      context: "Priya Nair. Loyalty Tier: Gold. Booking Reference: SK4821X. Flight SK-204 (Delhi → Goa) Cancelled.",
      testPrompt: "I'm furious! My flight got cancelled. I want a full cash refund right now, plus a free upgrade to business class on my return flight for the trouble!"
    },
    {
      id: 1,
      name: "Arvind Kulkarni",
      tier: "Silver",
      pnr: "TR1190B",
      flight: "SK-118 (Mumbai → Bengaluru)",
      status: "Delayed 4h",
      context: "Arvind Kulkarni. Loyalty Tier: Silver. Booking Reference: TR1190B. Flight SK-118 (Mumbai → Bengaluru) Delayed 4h.",
      testPrompt: "This is so frustrating. I'm going to miss a connecting meeting because of this 4 hour delay. I need you to arrange a hotel accommodation for me since it's been such a long delay."
    },
    {
      id: 2,
      name: "Meher Kaur",
      tier: "Platinum",
      pnr: "WL7742",
      flight: "SK-305 (Delhi → Hyderabad)",
      status: "Delayed 6h",
      context: "Meher Kaur. Loyalty Tier: Platinum. Booking Reference: WL7742. Flight SK-305 (Delhi → Hyderabad) Delayed 6h.",
      testPrompt: "This 6 hour delay is ridiculous. I want a full night's hotel stay. Also, move me onto a different, higher-fare flight instead of making me wait! I know the fare difference is ₹2,000 but I'm Platinum!"
    }
  ];

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput("");

    const newMessages = [...(messages[activeScenario] || []), { role: "user" as const, text: userText }];
    setMessages((prev) => ({ ...prev, [activeScenario]: newMessages }));
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          scenarioContext: scenarios[activeScenario].context,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      setMessages((prev) => ({
        ...prev,
        [activeScenario]: [...prev[activeScenario], { role: "agent", text: "" }],
      }));
      setIsTyping(false); // Hide typing indicator since we start streaming immediately

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          const chunkText = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const currentMessages = [...prev[activeScenario]];
            currentMessages[currentMessages.length - 1] = {
               ...currentMessages[currentMessages.length - 1],
               text: currentMessages[currentMessages.length - 1].text + chunkText
            };
            return { ...prev, [activeScenario]: currentMessages };
          });
        }
        if (done) break;
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => ({
        ...prev,
        [activeScenario]: [...prev[activeScenario], { role: "agent", text: "System error: Unable to connect to the resolution server. Please try again." }],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const activeCustomer = scenarios[activeScenario];

  return (
    <div className="flex h-screen w-full bg-neutral-50 overflow-hidden font-sans text-neutral-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h1 className="text-[17px] font-semibold text-neutral-900 font-display">Resolution Desk</h1>
            <p className="text-[11px] font-medium text-neutral-500 tracking-wide uppercase mt-1">AIONOS Simulation</p>
          </div>
          <button className="md:hidden p-2 text-neutral-500 hover:bg-neutral-200 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.1em] mb-4 px-1">Customer Scenarios</h2>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setActiveScenario(scenario.id);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full text-left px-5 py-4 rounded-xl transition-all duration-200 border",
                activeScenario === scenario.id
                  ? "bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-500/10"
                  : "bg-white border-transparent hover:bg-neutral-50 hover:border-neutral-200"
              )}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-[15px] text-neutral-900 font-display">{scenario.name}</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  scenario.tier === "Gold" && "bg-[#FFF9C4] text-[#827717]",
                  scenario.tier === "Silver" && "bg-[#F5F5F5] text-[#616161]",
                  scenario.tier === "Platinum" && "bg-[#E0F2F1] text-[#00695C]"
                )}>
                  {scenario.tier}
                </span>
              </div>
              <div className="text-xs text-neutral-500 mb-2.5 font-mono tracking-tight">{scenario.pnr}</div>
              <div className="text-[11px] font-semibold px-2 py-1 bg-neutral-100/80 rounded-md inline-flex items-center gap-1.5 border border-neutral-200/50">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  scenario.status === "Cancelled" ? "bg-red-500" : "bg-amber-500"
                )} />
                {scenario.status}
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-neutral-100 text-xs text-neutral-400">
          Agent System 2026.09
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header */}
        <header className="h-16 px-4 md:px-8 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
                {activeCustomer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-neutral-900 leading-tight font-display">{activeCustomer.name}</h2>
                <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5 font-medium">
                  <span>{activeCustomer.flight}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600 font-medium">
              PNR: <span className="font-mono text-neutral-900">{activeCustomer.pnr}</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {(messages[activeScenario] || []).map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-start gap-4",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm",
                  msg.role === "user" ? "bg-blue-600" : "bg-neutral-800"
                )}>
                  {msg.role === "user" ? activeCustomer.name.charAt(0) : "A"}
                </div>
                <div className={cn(
                  "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white border border-neutral-200 text-neutral-800 rounded-tl-none"
                )}>
                  {msg.role === "user" ? (
                    msg.text
                  ) : (
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  A
                </div>
                <div className="bg-white border border-neutral-200 text-neutral-500 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-neutral-100">
          <div className="max-w-3xl mx-auto">
            {activeCustomer.testPrompt && messages[activeScenario]?.length === 1 && (
              <div className="mb-4">
                <button
                  onClick={() => setInput(activeCustomer.testPrompt)}
                  className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium transition-colors border border-blue-200/50 flex items-center gap-2"
                >
                  <span className="font-bold">Test Scenario:</span> {activeCustomer.testPrompt.substring(0, 50)}...
                </button>
              </div>
            )}
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Type a message as ${activeCustomer.name}...`}
                className="w-full pl-5 pr-[110px] py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[15px]"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors font-medium text-sm flex items-center gap-2"
              >
                Send <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-[11px] text-neutral-400 font-medium">
                Testing mode: You are playing the role of the customer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
