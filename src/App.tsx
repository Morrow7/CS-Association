import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomeView from './views/HomeView';
import Honor from './views/Honor';
import Academic from './component/Academic';
import Community from './component/community';
import CommunityDetail from './views/CommunityDetail';
import './App.css';
import Register from './views/Register';
import Login from './views/Login';

function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('cs_user');
    if (!raw) return false;
    const user = JSON.parse(raw);
    return !!user && typeof user.username === 'string';
  } catch {
    return false;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn() ? <HomeView /> : <Register />} />
        <Route
          path="/login"
          element={isLoggedIn() ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route path="/home" element={<HomeView />} />
        <Route path="/honor" element={<Honor />} />
        <Route path="/academic" element={<Academic />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:id" element={<CommunityDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
