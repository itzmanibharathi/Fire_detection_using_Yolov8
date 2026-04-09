// src/components/ChartsSection.jsx (updated to use events)
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const ChartsSection = ({ events }) => { // Pass events
  const lineData = events.map(e => ({
    timestamp: new Date(e.start).toLocaleTimeString(),
    fire: e.label === 'fire' ? 1 : 0,
    smoke: e.label === 'smoke' ? 1 : 0
  }));

  const fireCount = events.filter(e => e.label==='fire').length;
  const smokeCount = events.filter(e => e.label==='smoke').length;
  const pieData = [{name:'Fire', value: fireCount}, {name:'Smoke', value: smokeCount}];

  const barData = [
    { range:'0-20%', count: events.filter(e=>e.confidence<0.2).length },
    { range:'20-40%', count: events.filter(e=>e.confidence>=0.2 && e.confidence<0.4).length },
    { range:'40-60%', count: events.filter(e=>e.confidence>=0.4 && e.confidence<0.6).length },
    { range:'60-80%', count: events.filter(e=>e.confidence>=0.6 && e.confidence<0.8).length },
    { range:'80-100%', count: events.filter(e=>e.confidence>=0.8).length }
  ];

  const COLORS = ['var(--danger)', 'var(--warning)'];

  return (
    <div className="row mb-4">
      <div className="col-md-6 mb-3">
        <h6>Fire vs Smoke Over Time</h6>
        <LineChart width={500} height={250} data={lineData}>
          <XAxis dataKey="timestamp"/>
          <YAxis/>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
          <Tooltip/>
          <Line type="monotone" dataKey="fire" stroke="var(--danger)" />
          <Line type="monotone" dataKey="smoke" stroke="var(--warning)" />
        </LineChart>
      </div>
      <div className="col-md-3 mb-3">
        <h6>Distribution</h6>
        <PieChart width={250} height={250}>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
            {pieData.map((entry,index)=><Cell key={index} fill={COLORS[index%COLORS.length]} />)}
          </Pie>
        </PieChart>
      </div>
      <div className="col-md-3 mb-3">
        <h6>Confidence Levels</h6>
        <BarChart width={250} height={250} data={barData}>
          <XAxis dataKey="range"/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="count" fill="var(--primary)" />
        </BarChart>
      </div>
    </div>
  );
};

export default ChartsSection;