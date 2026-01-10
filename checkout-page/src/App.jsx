import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Checkout from './pages/Checkout';

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/" element={<Navigate to="/checkout" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;