import React from 'react';
import logo from '../src/images/logo.jpg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>欢迎来到计算机科技协会的学习空间</p>
      </header>
    </div>
  );
}

export default App;
