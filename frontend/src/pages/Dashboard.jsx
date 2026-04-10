import { useState, useEffect } from "react";
import axios from "axios";
import { FiCamera, FiAlertTriangle, FiThermometer, FiCheckCircle, FiMapPin, FiClock } from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";

const Dashboard = () => {
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState({ fire: 0, smoke: 0, avgConf: 0 });
  const [selectedDetection, setSelectedDetection] = useState(null);

  const fetchDetections = async () => {
    try {
      const res = await axios.get("https://fire-detection-using-yolov8.onrender.com/api/detections");
      setDetections(res.data);
      
      const fireCount = res.data.filter(d => d.label === "fire").length;
      const smokeCount = res.data.filter(d => d.label === "smoke").length;
      const avgConf = res.data.length 
        ? res.data.reduce((acc, curr) => acc + curr.confidence, 0) / res.data.length 
        : 0;

      setStats({ fire: fireCount, smoke: smokeCount, avgConf: avgConf * 100 });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Aggregate for chart
  const chartData = detections.slice(0, 50).map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    confidence: d.confidence * 100
  })).reverse();

  const pieData = [
    { name: 'Fire', value: stats.fire },
    { name: 'Smoke', value: stats.smoke },
  ];
  const COLORS = ['#EF4444', '#F59E0B'];

  return (
    <div className="space-y-8 pb-10">
      
      {/* 🚀 TOP SECTION (STATS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Fire Alerts" value={stats.fire} icon={<FiAlertTriangle className="text-accent w-6 h-6" />} trend="Live" />
        <StatCard title="Smoke Alerts" value={stats.smoke} icon={<FiCamera className="text-warning w-6 h-6" />} trend="Live" />
        <StatCard title="Avg Confidence" value={`${stats.avgConf.toFixed(1)}%`} icon={<FiThermometer className="text-primary w-6 h-6" />} trend="Live" />
        <StatCard title="Total Alerts" value={detections.length} icon={<FiCheckCircle className="text-success w-6 h-6" />} trend="All Time" />
      </div>

      {/* 📊 CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-text-main mb-6">Detection Confidence Trends</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--color-text-muted)" tick={{fill: 'var(--color-text-muted)', fontSize: 12}} />
                <YAxis stroke="var(--color-text-muted)" tick={{fill: 'var(--color-text-muted)', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
                <Area type="monotone" dataKey="confidence" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorConf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-text-main mb-4 w-full text-left">Incident Ratio</h3>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 🖼️ LIVE DETECTION GALLERY */}
      <div>
        <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center">
          <FiCamera className="mr-3 text-primary" /> Live Detection Gallery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {detections.slice(0, 8).map(d => (
            <Card 
              key={d._id} 
              className="group"
              layoutId={`card-${d._id}`}
              onClick={() => setSelectedDetection(d)}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="relative h-48 overflow-hidden bg-background">
                {d.image_url ? (
                  <img src={d.image_url} alt="Detection" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">No Image</div>
                )}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md text-white uppercase tracking-wider ${d.label === 'fire' ? 'bg-accent/90' : 'bg-warning/90'}`}>
                    {d.label}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black/60 shadow-sm backdrop-blur-md text-white">
                    {(d.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-surface/80 backdrop-blur-md">
                <div className="flex flex-col text-sm text-text-muted space-y-1.5">
                  <div className="flex items-center">
                    <FiMapPin className="text-primary mr-2" /> 
                    <span className="truncate">{d.location || 'Unknown Location'}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <FiClock className="mr-2" /> 
                    {new Date(d.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {detections.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-muted">
              Processing data feed. No alerts triggered.
            </div>
          )}
        </div>
      </div>

      {/* 🧾 MODAL VIEW */}
      <Modal isOpen={!!selectedDetection} onClose={() => setSelectedDetection(null)}>
        {selectedDetection && (
          <div className="flex flex-col">
            <div className="w-full bg-black flex items-center justify-center relative max-h-[500px]">
              {selectedDetection.image_url ? (
                <img src={selectedDetection.image_url} alt="Full Detection" className="max-w-full max-h-[500px] object-contain" />
              ) : (
                <div className="p-20 text-text-muted">Image stream unavailable</div>
              )}
            </div>
            <div className="p-8 bg-surface">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-2xl font-black uppercase tracking-widest ${selectedDetection.label === 'fire' ? 'text-accent' : 'text-warning'}`}>
                  {selectedDetection.label} DETECTED
                </h3>
                <span className="px-4 py-2 bg-background border border-border-subtle rounded-xl text-lg font-bold text-text-main shadow-inner">
                  {(selectedDetection.confidence * 100).toFixed(2)}% Match
                </span>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="flex items-start">
                  <div className="p-3 bg-primary/10 rounded-2xl mr-4">
                    <FiMapPin className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Sector Location</p>
                    <p className="text-text-main font-semibold">{selectedDetection.location || 'Unknown Coordinates'}</p>
                    {(selectedDetection.lat && selectedDetection.lng) && (
                      <p className="text-xs text-text-muted mt-1">lat: {selectedDetection.lat}, lng: {selectedDetection.lng}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 bg-primary/10 rounded-2xl mr-4">
                    <FiClock className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Timestamp</p>
                    <p className="text-text-main font-semibold">{new Date(selectedDetection.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

const StatCard = ({ title, value, icon, trend }) => (
  <Card className="p-6 flex flex-col justify-between" whileHover={{ y: -4 }}>
    <div className="flex justify-between items-start mb-6">
      <div className="p-3.5 bg-background rounded-2xl border border-border-subtle">
        {icon}
      </div>
      <span className="text-xs font-bold text-text-muted bg-background px-3 py-1.5 rounded-full border border-border-subtle shadow-sm">{trend}</span>
    </div>
    <div>
      <h3 className="text-text-muted text-sm font-bold uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-4xl font-black text-text-main tracking-tight">
        {value}
      </p>
    </div>
  </Card>
);

export default Dashboard;