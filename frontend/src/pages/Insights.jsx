import { useState, useMemo } from "react";
import api from "../utils/api";
import { FiCpu, FiMessageSquare, FiSend, FiLoader, FiAlertOctagon, FiCopy, FiCheck, FiPrinter, FiShield, FiTrendingUp } from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { marked } from "marked";
import Card from "../components/ui/Card";

// Configure marked options for clean executive typography
marked.setOptions({
  gfm: true,
  breaks: true,
});

const QUICK_QUESTIONS = [
  "What is our current 7-day risk level?",
  "Recommend emergency actions for high smoke alerts",
  "How should field sensors be calibrated for high humidity?",
];

const Insights = () => {
  const [summary, setSummary] = useState("");
  const [meta, setMeta] = useState(null);
  const [modelUsed, setModelUsed] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [copied, setCopied] = useState(false);

  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await api.post("/api/ai/analyze");
      setSummary(res.data.summary);
      setMeta(res.data.meta);
      if (res.data.modelUsed) setModelUsed(res.data.modelUsed);
    } catch (err) {
      console.error(err);
      const serverDetails = err.response?.data?.details || err.response?.data?.error || err.message;
      setSummary(`Failed to generate assessment. Server message: ${serverDetails}. Ensure backend MongoDB is connected.`);
      setMeta({ fires: 0, smokes: 0, riskLevel: "Unknown", avgConfidence: 0, total: 0 });
    }
    setLoadingAnalysis(false);
  };

  const chartData = useMemo(() => {
    if (!meta) return [];
    return [
      { name: "Fire Alerts", value: meta.fires || 0 },
      { name: "Smoke Alerts", value: meta.smokes || 0 },
    ];
  }, [meta]);

  const COLORS = ["#ef4444", "#f59e0b"];

  const handleQuery = async (e, customQuery) => {
    if (e) e.preventDefault();
    const textToSend = customQuery || query;
    if (!textToSend.trim()) return;

    const userMessage = { role: "user", content: textToSend };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuery("");
    setLoadingChat(true);

    try {
      const res = await api.post("/api/ai/query", { query: userMessage.content });
      setChatHistory((prev) => [...prev, { role: "ai", content: res.data.answer, modelUsed: res.data.modelUsed }]);
    } catch (err) {
      const serverDetails = err.response?.data?.details || err.response?.data?.error || err.message;
      setChatHistory((prev) => [...prev, { role: "ai", content: `System notice: ${serverDetails}` }]);
    }
    setLoadingChat(false);
  };

  const handleCopyReport = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Safe HTML parse of markdown
  const formattedHtml = useMemo(() => {
    if (!summary) return "";
    try {
      return marked.parse(summary);
    } catch (e) {
      return summary;
    }
  }, [summary]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-8.5rem)] pb-6">
      {/* =========================================================================
          LEFT PANEL: Professional Executive Operational Briefing
          ========================================================================= */}
      <Card className="p-6 md:p-8 flex flex-col relative overflow-hidden h-full shadow-2xl border border-border-subtle bg-surface">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <FiAlertOctagon className="w-56 h-56" />
        </div>

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-border-subtle z-10 gap-3">
          <div className="flex items-center">
            <div className="p-3 bg-primary/20 text-primary rounded-2xl mr-3 shadow-inner">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-text-main tracking-tight">Executive Intelligence Report</h2>
                <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Formal Briefing
                </span>
              </div>
              <p className="text-xs text-text-muted">Multi-sensor Wildfire & Smoke Assessment</p>
            </div>
          </div>

          {modelUsed && (
            <span className="text-xs bg-surface border border-border-subtle text-text-muted px-3 py-1 rounded-xl font-mono self-start sm:self-auto shadow-sm">
              Engine: <strong className="text-primary">{modelUsed}</strong>
            </span>
          )}
        </div>

        {/* Action Header for Report */}
        {summary && (
          <div className="flex items-center justify-between mb-4 z-10 text-xs">
            <span className="text-text-muted font-medium">Reporting Window: Last 7 Days</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border-subtle text-text-main transition-colors font-medium shadow-sm"
              >
                {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border-subtle text-text-main transition-colors font-medium shadow-sm"
              >
                <FiPrinter />
                <span>Print</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Report Canvas */}
        <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar z-10 text-text-main pr-1">
          {summary ? (
            <div className="space-y-6">
              {/* Executive Metrics Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-background/80 border border-border-subtle p-3.5 rounded-2xl shadow-inner flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Assessed Threat</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-lg font-black tracking-tight ${
                        meta?.riskLevel === "High"
                          ? "text-red-500"
                          : meta?.riskLevel === "Medium"
                          ? "text-amber-500"
                          : "text-green-500"
                      }`}
                    >
                      {meta?.riskLevel || "Low"} Risk
                    </span>
                  </div>
                </div>

                <div className="bg-background/80 border border-border-subtle p-3.5 rounded-2xl shadow-inner flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Detections</span>
                  <p className="text-lg font-black text-text-main mt-1">
                    {(meta?.fires || 0) + (meta?.smokes || 0)} Incidents
                  </p>
                </div>

                <div className="bg-background/80 border border-border-subtle p-3.5 rounded-2xl shadow-inner flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">AI Confidence</span>
                  <p className="text-lg font-black text-primary mt-1">
                    {meta?.avgConfidence ? `${meta.avgConfidence.toFixed(1)}%` : "0.0%"}
                  </p>
                </div>
              </div>

              {/* Chart breakdown if any incidents exist */}
              {meta && (meta.fires > 0 || meta.smokes > 0) && (
                <div className="bg-background/50 border border-border-subtle p-4 rounded-2xl flex items-center justify-between">
                  <div className="w-36 h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={4} dataKey="value">
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: "var(--color-surface)", borderRadius: "10px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs space-y-1 flex-1 pl-4">
                    <p className="font-bold text-text-main">Incident Classification Ratio</p>
                    <p className="text-red-400 font-semibold">• Fire Alerts: {meta.fires}</p>
                    <p className="text-amber-400 font-semibold">• Smoke Alerts: {meta.smokes}</p>
                  </div>
                </div>
              )}

              {/* Formatted Markdown Executive Document */}
              <div
                className="bg-background/60 border border-border-subtle rounded-2xl p-6 shadow-sm report-markdown-body"
                dangerouslySetInnerHTML={{ __html: formattedHtml }}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-sm">
                <FiTrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Awaiting Intelligence Generation</h3>
              <p className="text-text-muted text-xs max-w-sm leading-relaxed mb-6">
                Click below to synthesize current optical sensor telemetry, compute rolling threat vectors, and assemble an Executive Intelligence Briefing.
              </p>
            </div>
          )}
        </div>

        {/* Generate / Refresh Button */}
        <button
          onClick={fetchAnalysis}
          disabled={loadingAnalysis}
          className="w-full bg-primary hover:bg-blue-600 disabled:opacity-60 text-white py-3.5 px-6 rounded-2xl font-bold transition-all flex justify-center items-center group z-10 shadow-lg shadow-primary/25 cursor-pointer"
        >
          {loadingAnalysis ? (
            <>
              <FiLoader className="animate-spin mr-2.5 w-5 h-5" />
              <span>Analyzing Sensor Telemetry...</span>
            </>
          ) : (
            <span>{summary ? "Regenerate Intelligence Briefing" : "Generate Operational Risk Assessment"}</span>
          )}
        </button>
      </Card>

      {/* =========================================================================
          RIGHT PANEL: Interactive AI Safety Assistant
          ========================================================================= */}
      <Card className="p-6 md:p-8 flex flex-col h-full shadow-2xl border border-border-subtle bg-surface">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center">
            <div className="p-3 bg-accent/15 text-accent rounded-2xl mr-3 shadow-inner">
              <FiMessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-main tracking-tight">Fire Safety Assistant</h2>
              <p className="text-xs text-text-muted">Live Contextual Q&A with Facility Telemetry</p>
            </div>
          </div>
          <span className="text-[10px] bg-green-500/20 text-green-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Ready
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuery(null, q)}
              disabled={loadingChat}
              className="text-[11px] bg-surface hover:bg-surface-hover border border-border-subtle text-text-muted hover:text-text-main px-2.5 py-1 rounded-xl transition-all font-medium text-left truncate max-w-full"
            >
              💡 {q}
            </button>
          ))}
        </div>

        {/* Chat History Canvas */}
        <div className="flex-1 bg-background border border-border-subtle rounded-2xl p-4 mb-4 overflow-y-auto custom-scrollbar space-y-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-muted text-xs p-6">
              <FiCpu className="w-10 h-10 mb-3 text-border-subtle" />
              <p className="font-semibold text-text-main mb-1">Interactive Facility Assistant</p>
              <p className="max-w-xs text-text-muted">
                Ask questions regarding fire containment protocols, sensor calibration, or current facility status.
              </p>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 px-4 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm shadow-md"
                      : "bg-surface border border-border-subtle text-text-main rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <div
                      className="report-markdown-body"
                      dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || "") }}
                    />
                  ) : (
                    msg.content
                  )}
                  {msg.modelUsed && (
                    <div className="text-[9px] text-text-muted mt-2 pt-1 border-t border-border-subtle/50 font-mono">
                      Via {msg.modelUsed}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loadingChat && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border-subtle text-text-muted rounded-2xl rounded-tl-sm p-3 px-4 flex items-center shadow-sm">
                <span className="text-xs mr-2 font-medium">Assistant thinking</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleQuery} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loadingChat}
            placeholder="Ask regarding containment protocols, active sensors, or risk..."
            className="w-full bg-background border border-border-subtle text-text-main rounded-2xl py-3.5 pl-4 pr-14 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={loadingChat || !query.trim()}
            className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-blue-600 disabled:opacity-40 text-white w-10 flex items-center justify-center rounded-xl transition-all shadow-md cursor-pointer"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Insights;
