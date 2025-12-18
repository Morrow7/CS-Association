import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './views/Landing';
import Home from './views/Home';
import Honor from './views/Honor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/honor" element={<Honor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
