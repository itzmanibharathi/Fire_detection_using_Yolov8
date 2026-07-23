import { useState } from "react";
import api from "../utils/api";
import { FiCpu, FiMessageSquare, FiSend, FiLoader, FiAlertOctagon } from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import Card from "../components/ui/Card";

const Insights = () => {
  const [summary, setSummary] = useState("");
  const [meta, setMeta] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await api.post("/api/ai/analyze");
      setSummary(res.data.summary);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
      const serverDetails = err.response?.data?.details || err.response?.data?.error || err.message;
      setSummary(`Failed to generate analysis. Server says: ${serverDetails}. Please ensure your backend is restarted and Auth token is valid.`);
      setMeta({ fires: 0, smokes: 0, riskLevel: "Unknown", avgConfidence: 0 });
    }
    setLoadingAnalysis(false);
  };

  const chartData = meta ? [
    { name: 'Fire Alerts', value: meta.fires },
    { name: 'Smoke Alerts', value: meta.smokes },
  ] : [];

  const COLORS = ['#ef4444', '#9ca3af'];

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setChatHistory([...chatHistory, userMessage]);
    setQuery("");
    setLoadingChat(true);

    try {
      const res = await api.post("/api/ai/query", { query: userMessage.content });
      setChatHistory([...chatHistory, userMessage, { role: "ai", content: res.data.answer }]);
    } catch (err) {
      const serverDetails = err.response?.data?.details || err.response?.data?.error || err.message;
      setChatHistory([...chatHistory, userMessage, { role: "ai", content: `Error connecting: ${serverDetails}` }]);
    }
    setLoadingChat(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      
      {/* Analysis Panel */}
      <Card className="p-8 flex flex-col relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <FiAlertOctagon className="w-48 h-48" />
        </div>
        
        <div className="flex items-center mb-8 pb-4 border-b border-border-subtle z-10">
          <div className="p-3 bg-primary/20 text-primary rounded-xl mr-4">
            <FiCpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-main">System Analytics</h2>
            <p className="text-sm text-text-muted">AI-driven risk assessment</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar z-10 text-text-muted">
          {summary ? (
             <div className="space-y-6">
               <div className="flex space-x-6 items-center bg-surface border border-border-subtle p-4 rounded-2xl">
                  <div className="w-1/2 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={5} dataKey="value">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)'}} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 text-center md:text-left">
                    <p className="text-xl font-bold text-text-main mb-1">Risk Level: <span className={meta.riskLevel === 'High' ? 'text-accent' : meta.riskLevel === 'Medium' ? 'text-orange-400' : 'text-green-500'}>{meta.riskLevel}</span></p>
                    <p className="text-sm font-medium">Recorded Anomalies: {meta.fires + meta.smokes}</p>
                    <p className="text-sm font-medium mt-1">Average Confidence: {meta.avgConfidence.toFixed(1)}%</p>
                  </div>
               </div>
               <div className="prose prose-invert max-w-none text-text-muted">
                 {summary.split('\n').map((line, i) => (
                   <p key={i} className="mb-2 leading-relaxed">{line}</p>
                 ))}
               </div>
             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-text-muted mb-4 max-w-sm">
                Generate an AI-powered summary of your recent detections, complete with risk analysis and graphical charting representation.
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={fetchAnalysis}
          disabled={loadingAnalysis}
          className="w-full bg-surface-hover hover:bg-border-subtle/50 text-text-main py-4 rounded-2xl font-semibold transition-colors flex justify-center items-center group z-10 border border-border-subtle shadow-md"
        >
          {loadingAnalysis ? (
            <><FiLoader className="animate-spin mr-2" /> Analyzing Data...</>
          ) : (
            <>Generate Risk Assessment</>
          )}
        </button>
      </Card>

      {/* Chat Bot Panel */}
      <Card className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-6">
          <FiMessageSquare className="text-accent w-6 h-6 mr-3" />
          <h2 className="text-xl font-bold text-text-main">Fire Safety Assistant</h2>
        </div>

        <div className="flex-1 bg-background border border-border-subtle rounded-2xl p-4 mb-4 overflow-y-auto custom-scrollbar space-y-4">
          {chatHistory.length === 0 ? (
             <div className="h-full flex items-center justify-center text-text-muted text-sm">
               Ask me anything about fire safety, evacuation, or system parameters.
             </div>
          ) : (
             chatHistory.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-2xl p-3 px-5 ${
                   msg.role === 'user' 
                     ? 'bg-primary text-white rounded-tr-sm shadow-md' 
                     : 'bg-surface-hover border border-border-subtle text-text-muted rounded-tl-sm shadow-sm'
                 }`}>
                   {msg.content}
                 </div>
               </div>
             ))
          )}
          {loadingChat && (
            <div className="flex justify-start">
               <div className="bg-surface-hover border border-border-subtle text-text-muted rounded-2xl rounded-tl-sm p-3 px-5 flex items-center shadow-sm">
                 <div className="flex space-x-1">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                 </div>
               </div>
            </div>
          )}
        </div>

        <form onSubmit={handleQuery} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loadingChat}
            placeholder="Ask a question..."
            className="w-full bg-background border border-border-subtle text-text-main rounded-xl py-4 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={loadingChat || !query.trim()}
            className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-blue-600 disabled:bg-surface-hover disabled:text-text-muted text-white w-10 flex items-center justify-center rounded-lg transition-colors shadow-sm"
          >
            <FiSend />
          </button>
        </form>
      </Card>

    </div>
  );
};

export default Insights;
