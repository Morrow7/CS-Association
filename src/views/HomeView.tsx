import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaJava, FaPython, FaVuejs, FaReact } from "react-icons/fa6";
import { SiNextdotjs, SiTypescript } from "react-icons/si";
import {
    LetterGlitch,
    StarBorder,
    ClickSpark,
    DecryptedText,
    TrueFocus
} from '@appletosolutions/reactbits';
import '../App.css';

export default function Home() {
    const navigate = useNavigate();
    const cards = [
        {
            title: 'Industrial Software Center',
            description: 'Construct the interactive aesthetics of the digital world..',
            icon: FaReact,
            color: '#000000',
            path: null
        },
        {
            title: 'Industrial Animation Center',
            description: 'The core engine for building the digital world.',
            icon: FaJava,
            color: '#ff0055',
            path: null
        },
        {
            title: 'artificial intelligence',
            description: 'Inspire the future, illuminate everything.',
            icon: FaPython,
            color: '#00ff88',
            path: null
        },
        {
            title: 'Learning Community',
            description: 'Technical Exchange Center',
            icon: SiTypescript,
            color: '#3178C6',
            path: "/Community"
        },
        {
            title: 'competition',
            description: 'Test and enhance ones abilities in actual combat situations.',
            icon: FaVuejs,
            color: '#aa00ff',
            path: '/honor'
        },
        {
            title: 'academic paper',
            description: 'Precision, exploration, reflection.',
            icon: SiNextdotjs,
            color: '#00aaff',
            path: '/Academic'
        },
    ];

    return (
        <div className="App-header" style={{
            justifyContent: 'flex-start',
            paddingTop: '40px',
            overflowY: 'auto',
            height: '100vh',
            boxSizing: 'border-box',
            display: 'block' // Override flex from App-header to allow scrolling
        }}>

            {/* Background Effect */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.3, pointerEvents: 'none' }}>
                <LetterGlitch
                    glitchSpeed={40}
                    centerVignette={true}
                    outerVignette={true}
                    smooth={true}
                    glitchColors={['#ffffff6c', '#4cf684ff', '#ff5990ff']}
                />
            </div>

            <div style={{ position: 'relative', zIndex: 10, padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>

                <header style={{ textAlign: 'center', marginBottom: '60px', marginTop: '40px' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#fff' }}>
                        <DecryptedText
                            text="CS-Association"
                            speed={100}
                            maxIterations={20}
                            characters="ABCD1234!?"
                            className="revealed"
                            parentClassName="all-letters"
                            animateOn="view"
                        />
                    </h1>
                    <h2 style={{ fontSize: '2rem', color: '#022b77ff' }}>
                        <TrueFocus
                            sentence="Welcome to the CS-Association!"
                            manualMode={false}
                            blurAmount={5}
                            borderColor="#e8efefff"
                            animationDuration={2}
                            pauseBetweenAnimations={1}
                        />
                    </h2>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '30px',
                    width: '100%'
                }}>
                    {cards.map((card, index) => (
                        <div key={index} style={{ height: '100%' }}>
                            <StarBorder as="div" color={card.color} speed="4s">
                                <div style={{
                                    padding: '2.5rem',
                                    background: 'white',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '15px',
                                    alignItems: 'flex-start',
                                    textAlign: 'left',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'default'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{
                                        fontSize: '3.5rem',
                                        marginBottom: '1.5rem',
                                        color: card.color,
                                        display: 'inline-block',
                                        animation: 'App-logo-spin 10s linear infinite'
                                    }}>
                                        {React.createElement(card.icon as any)}
                                    </div>

                                    <h3 style={{
                                        color: '#353333ff',
                                        fontSize: '1.8rem',
                                        marginBottom: '1rem',
                                        fontFamily: "'Orbitron', sans-serif"
                                    }}>
                                        {card.title}
                                    </h3>

                                    <p style={{
                                        color: '#aaa',
                                        lineHeight: '1.6',
                                        marginBottom: '2rem',
                                        fontSize: '1rem',
                                        flexGrow: 1
                                    }}>
                                        {card.description}
                                    </p>

                                    <ClickSpark sparkColor={card.color} sparkCount={12} sparkRadius={20}>
                                        <button style={{
                                            padding: '12px 25px',
                                            background: 'transparent',
                                            border: `1px solid ${card.color}`,
                                            color: card.color,
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = `${card.color}20`; // 20 hex = ~12% opacity
                                                e.currentTarget.style.boxShadow = `0 0 20px ${card.color}60`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            onClick={() => {
                                                if (card.path) {
                                                    navigate(card.path);
                                                } else {
                                                    console.log(`Clicked ${card.title}`);
                                                }
                                            }}
                                        >
                                            Explore
                                        </button>
                                    </ClickSpark>
                                </div>
                            </StarBorder>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
