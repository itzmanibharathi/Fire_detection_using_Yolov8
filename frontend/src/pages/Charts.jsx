// src/pages/Charts.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { fetchDetections } from "../api";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, getYear, getMonth } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { groupDetections } from "../utils/groupDetections";

const COLORS = ["#dc3545", "#28a745"]; // fire, smoke
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const Charts = () => {
  const [detections, setDetections] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [analysisText, setAnalysisText] = useState("");
  const [error, setError] = useState("");

  const reportRef = useRef();

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDetections();
        setDetections(data);
        setEvents(groupDetections(data));
        setError("");
      } catch (e) {
        setError("Failed to load detection data.");
      }
    };
    load();
  }, []);

  /* ================= FILTER EVENTS ================= */
  const filteredEvents = useMemo(() => {
    return events.filter(
      (e) => new Date(e.eventStartTime).getFullYear() >= 2017
    );
  }, [events]);

  /* ================= YEAR DATA ================= */
  const yearData = useMemo(() => {
    const currentYear = getYear(new Date());
    const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => 2017 + i);

    return years.map((year) => {
      const yearEvents = filteredEvents.filter(
        (e) => getYear(new Date(e.eventStartTime)) === year
      );
      return {
        year,
        fires: yearEvents.filter((e) => e.label === "fire").length,
        smokes: yearEvents.filter((e) => e.label === "smoke").length,
      };
    });
  }, [filteredEvents]);

  /* ================= MONTH DATA ================= */
  const monthData = useMemo(() => {
    if (!selectedYear) return [];
    return MONTHS.map((m, i) => {
      const monthEvents = filteredEvents.filter((e) => {
        const d = new Date(e.eventStartTime);
        return getYear(d) === selectedYear && getMonth(d) === i;
      });
      return {
        month: m,
        fires: monthEvents.filter((e) => e.label === "fire").length,
        smokes: monthEvents.filter((e) => e.label === "smoke").length,
      };
    }).filter(m => m.fires || m.smokes);
  }, [filteredEvents, selectedYear]);

  /* ================= PIE DATA ================= */
  const distributionData = useMemo(() => {
    if (!selectedMonth) return [];
    const index = MONTHS.indexOf(selectedMonth);

    const monthEvents = filteredEvents.filter((e) => {
      const d = new Date(e.eventStartTime);
      return getYear(d) === selectedYear && getMonth(d) === index;
    });

    return [
      { name: "Fire", value: monthEvents.filter(e => e.label === "fire").length },
      { name: "Smoke", value: monthEvents.filter(e => e.label === "smoke").length },
    ].filter(d => d.value > 0);
  }, [filteredEvents, selectedMonth, selectedYear]);

  /* ================= LOCAL ANALYSIS (NO AI, NO API) ================= */
  const generateAnalysis = (fires, smokes) => {
    const total = fires + smokes;
    if (!total) return "No events detected during this period.";

    const risk =
      fires > 20 ? "HIGH" :
      fires > 10 ? "MODERATE" : "LOW";

    return `
In ${selectedMonth} ${selectedYear}, a total of ${total} fire-related events were detected.
Fire incidents: ${fires}
Smoke incidents: ${smokes}
Overall risk level: ${risk}.
Monitoring and preventive measures are recommended accordingly.
    `.trim();
  };

  /* ================= HANDLERS ================= */
  const handleYearClick = (data) => {
    setSelectedYear(data.year);
    setSelectedMonth(null);
    setAnalysisText("");
  };

  const handleMonthClick = (data) => {
    setSelectedMonth(data.month);
    setAnalysisText(generateAnalysis(data.fires, data.smokes));
  };

  /* ================= PDF ================= */
  const downloadPDF = async () => {
    const pdf = new jsPDF();
    const canvasEls = reportRef.current.querySelectorAll(".recharts-responsive-container");

    pdf.text("Fire Detection Report", 105, 15, { align: "center" });

    let y = 25;
    for (let el of canvasEls) {
      const canvas = await html2canvas(el);
      const img = canvas.toDataURL("image/png");
      pdf.addImage(img, "PNG", 10, y, 190, 80);
      y += 90;
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }
    }
    pdf.save("Fire_Report.pdf");
  };

  /* ================= RENDER ================= */
  return (
    <div className="container-fluid" ref={reportRef}>
      <h2 className="mb-4">Fire Detection Analytics</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <button className="btn btn-primary mb-4" onClick={downloadPDF}>
        Download PDF
      </button>

      {/* YEAR CHART */}
      <h5>Year-wise Fire & Smoke Events</h5>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={yearData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="fires"
            stroke={COLORS[0]}
            strokeWidth={2.5}
            activeDot={{ r: 8, onClick: (_, p) => handleYearClick(p.payload) }}
          />
          <Line
            type="monotone"
            dataKey="smokes"
            stroke={COLORS[1]}
            strokeWidth={2.5}
            activeDot={{ r: 8, onClick: (_, p) => handleYearClick(p.payload) }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* MONTH CHART */}
      {monthData.length > 0 && (
        <>
          <h5 className="mt-5">Monthly Events – {selectedYear}</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="fires"
                stroke={COLORS[0]}
                strokeWidth={2.5}
                activeDot={{ r: 8, onClick: (_, p) => handleMonthClick(p.payload) }}
              />
              <Line
                type="monotone"
                dataKey="smokes"
                stroke={COLORS[1]}
                strokeWidth={2.5}
                activeDot={{ r: 8, onClick: (_, p) => handleMonthClick(p.payload) }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* PIE */}
      {distributionData.length > 0 && (
        <>
          <h5 className="mt-5">Distribution – {selectedMonth}</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={distributionData} dataKey="value" label>
                {distributionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}

      {/* ANALYSIS */}
      {analysisText && (
        <div className="card mt-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Automated Analysis</h5>
            <p className="card-text">{analysisText}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;
