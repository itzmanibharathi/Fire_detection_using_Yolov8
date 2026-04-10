import { useState, useEffect } from "react";
import axios from "axios";
import { FiFilter, FiImage, FiDownload, FiLayers } from "react-icons/fi";
import { motion } from "framer-motion";
import Card from "../components/ui/Card";

const History = () => {
  const [detections, setDetections] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = "https://fire-detection-using-yolov8.onrender.com/api/detections";
        const queryParams = [];
        if (startDate && endDate) {
          queryParams.push(`startDate=${startDate}&endDate=${endDate}`);
        }
        if (queryParams.length > 0) {
          url += `?${queryParams.join('&')}`;
        }
        const res = await axios.get(url);
        setDetections(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  const filteredDetections = detections.filter((d) => 
    filterType === "all" ? true : d.label === filterType
  );

  const downloadCSV = () => {
    if (filteredDetections.length === 0) return;
    
    const headers = ["Timestamp", "Type", "Confidence", "Location", "Latitude", "Longitude", "Image URL"];
    const csvRows = [headers.join(",")];
    
    filteredDetections.forEach(d => {
      csvRows.push([
        `"${new Date(d.timestamp).toLocaleString()}"`,
        d.label,
        d.confidence,
        `"${d.location || ""}"`,
        d.lat || "",
        d.lng || "",
        d.image_url || ""
      ].join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `firewatch_data_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-main">Detection History</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-surface border border-border-subtle p-1.5 rounded-xl">
            <span className="text-sm text-text-muted px-2">From:</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-text-main text-sm focus:outline-none border-none cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-2 bg-surface border border-border-subtle p-1.5 rounded-xl">
            <span className="text-sm text-text-muted px-2">To:</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-text-main text-sm focus:outline-none border-none cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-2 bg-surface border border-border-subtle p-1.5 rounded-xl">
            <FiFilter className="text-text-muted ml-2" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-text-main text-sm focus:outline-none pr-4 border-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="fire">Fire Only</option>
              <option value="smoke">Smoke Only</option>
            </select>
          </div>
          <button 
            onClick={downloadCSV}
            className="flex items-center space-x-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-md shadow-primary/20"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="bg-background border-b border-border-subtle text-xs uppercase text-text-muted font-bold">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Confidence</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6 text-center">Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {filteredDetections.map((d, index) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={d._id} 
                  className="border-b border-border-subtle hover:bg-surface-hover transition-colors"
                >
                  <td className="py-4 px-6 text-text-main font-medium">
                    {new Date(d.timestamp).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      d.label === "fire" ? "bg-accent/20 text-accent border border-accent/30" : "bg-warning/20 text-warning border border-warning/30"
                    }`}>
                      {d.label}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-text-main">
                    <div className="flex items-center">
                      <div className="w-24 bg-background rounded-full h-2 mr-3 border border-border-subtle">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${d.confidence * 100}%` }}
                          transition={{ duration: 1 }}
                          className={`h-2 rounded-full ${d.confidence > 0.8 ? 'bg-success' : 'bg-warning'}`} 
                        />
                      </div>
                      {(d.confidence * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-main">
                    {d.location || "Unknown Location"}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {d.image_url ? (
                      <a href={d.image_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center p-2 rounded-xl bg-background hover:bg-primary hover:text-white border border-border-subtle text-primary transition-colors shadow-sm">
                        <FiImage className="w-5 h-5"/>
                      </a>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredDetections.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center text-text-muted">
              <FiLayers className="w-12 h-12 mb-4 text-border-subtle" />
              <p className="text-lg">No detections found for the selected filter.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default History;
