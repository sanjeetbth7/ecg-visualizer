// src/App.jsx
import React from 'react';
import ECGChart from './components/ECGChart';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <ECGChart />
    </div>
  );
}

export default App;
