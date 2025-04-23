import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const WINDOW_SIZE = 800;
const INTERVAL_MS = 20;

export default function ECGChart() {
  const [fullECG, setFullECG] = useState([]);
  const [rPeaks, setRPeaks] = useState([]);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('/mlii.json')
      .then(res => res.json())
      .then(setFullECG);
    fetch('/r_peaks.json')
      .then(res => res.json())
      .then(setRPeaks);
  }, []);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setPosition(p => {
          if (p + WINDOW_SIZE >= fullECG.length) {
            clearInterval(timerRef.current);
            return p;
          }
          return p + 1;
        });
      }, INTERVAL_MS);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, fullECG]);

  const windowData = fullECG.slice(position, position + WINDOW_SIZE);

  const visibleRPeaks = rPeaks
    .filter(idx => idx >= position && idx < position + WINDOW_SIZE)
    .map(idx => ({ x: idx, y: fullECG[idx] }));

  const chartData = {
    labels: windowData.map((_, i) => position + i),
    datasets: [
      {
        label: 'ECG Signal (MLII)',
        data: windowData,
        borderColor: '#10B981',
        pointRadius: 0,
        borderWidth: 1.5,
        tension: 0.1,
      },
      {
        label: 'R-Peaks',
        data: visibleRPeaks,
        backgroundColor: 'red',
        pointRadius: 5,
        type: 'scatter',
        showLine: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Live ECG Trace (with R-Peaks)',
        font: { size: 20 },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Sample Index' },
        ticks: { maxTicksLimit: 10 },
      },
      y: {
        title: { display: true, text: 'Voltage (mV)' },
      },
    },
  };

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setPlaying(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ▶ Play
        </button>
        <button
          onClick={() => setPlaying(false)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          ⏸ Pause
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setPosition(0);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          ⏹ Reset
        </button>
      </div>

      <div className="relative w-full h-[550px] bg-white rounded-xl shadow-lg p-4">
        {windowData.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="text-center mt-20 text-gray-500">Loading ECG waveform…</p>
        )}
      </div>
    </div>
  );
}
