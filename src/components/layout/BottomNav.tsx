import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Zap, MessageSquare, BookOpen, Settings } from 'lucide-react';
import './BottomNav.css';

const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav glass">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <Home size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
            <span>Ana Sayfa</span>
          </>
        )}
      </NavLink>
      <NavLink to="/morse" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <Zap size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
            <span>Mors</span>
          </>
        )}
      </NavLink>
      <NavLink to="/q-codes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <MessageSquare size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
            <span>Q-Kodları</span>
          </>
        )}
      </NavLink>
      <NavLink to="/logbook" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <BookOpen size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
            <span>Log</span>
          </>
        )}
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <Settings size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
            <span>Ayarlar</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomNav;
