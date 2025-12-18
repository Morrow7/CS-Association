import React from 'react';
import CircularGallery from './CircularGallery';
import Galaxy from './Galaxy';

export default function Honor() {
    // List of available image IDs (skipping 6 as it is missing)
    const imageIds = [
        1, 2, 3, 4, 5,
        7, 8, 9, 10, 11,
        12, 13, 14, 15, 16,
        17, 18, 19, 20, 21
    ];

    const items = imageIds.map(id => ({
        image: require(`../images/${id}.jpg`),
        text: `Honor ${id}`
    }));

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
            <Galaxy
                mouseRepulsion={true}
                mouseInteraction={true}
                density={2.5}
                glowIntensity={1.2}
                saturation={0.8}
                hueShift={240}
                starSpeed={1.0}
                rotationSpeed={0.2}
            />
            <div style={{ position: 'relative', zIndex: 1, height: '100%', width: '100%' }}>
                <h1 style={{ color: 'white', textAlign: 'center', paddingTop: '20px' }}>Honor Hall</h1>

                <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', width: '100%' }}>
                    <CircularGallery
                        items={items}
                        bend={1}
                        textColor="#ffffff"
                        borderRadius={0.05}
                        scrollEase={0.02}
                    />
                </div>
            </div>
        </div>
    );
}
