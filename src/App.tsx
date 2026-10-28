import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Morse from './pages/Morse';
import MorseTraining from './pages/MorseTraining';
import QCodes from './pages/QCodes';
import Logbook from './pages/Logbook';
import Settings from './pages/Settings';
import Repeaters from './pages/Repeaters';
import Exams from './pages/Exams';
import Cevrim from './pages/Cevrim';
import Directory from './pages/Directory';
import ExamGuide from './pages/ExamGuide';
import ExamSimulation from './pages/ExamSimulation';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const App: React.FC = () => {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('dilaver_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="morse" element={<Morse />} />
          <Route path="morse-training" element={<MorseTraining />} />
          <Route path="q-codes" element={<QCodes />} />
          <Route path="logbook" element={<Logbook />} />
          <Route path="directory" element={<Directory />} />
          <Route path="settings" element={<Settings />} />
          <Route path="repeaters" element={<Repeaters />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exam-guide" element={<ExamGuide />} />
          <Route path="exam-simulation" element={<ExamSimulation />} />
          <Route path="cevrim" element={<Cevrim />} />
        </Route>
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
