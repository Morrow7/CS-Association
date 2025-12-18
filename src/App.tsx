import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './views/Landing';
import HomeView from './views/HomeView';
import Honor from './views/Honor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Home" element={<HomeView />} />
        <Route path="/honor" element={<Honor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
