import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logo.jpg';
import '../App.css';

function Landing() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/home');
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p onClick={handleStartClick} style={{ cursor: 'pointer' }}>
          欢迎来到计算机科技协会的学习空间
        </p>
      </header>
    </div>
  );
}

export default Landing;
