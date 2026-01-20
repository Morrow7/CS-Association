import { useEffect, useState } from 'react';
import Galaxy from '../views/Galaxy';

type AcademicItem = {
    id: number;
    title: string;
    description: string;
    link: string;
}
export default function Academic() {
    const [items, setItems] = useState<AcademicItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/academic");
                if (!res.ok) {
                    throw new Error("加载失败");
                }
                const data = await res.json();
                if (data.ok && Array.isArray(data.items)) {
                    setItems(data.items);
                } else {
                    throw new Error("数据格式错误");
                }
            } catch (e) {
                setError("无法获取学术论文内容");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [])

    return (
        <div
            style={{
                height: '100vh',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: '#000'
            }}
        >
            <Galaxy
                mouseRepulsion
                mouseInteraction
                density={2.5}
                glowIntensity={1.2}
                saturation={0.8}
                hueShift={240}
                starSpeed={1.0}
                rotationSpeed={0.2}
            />

            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    paddingTop: '40px',
                    boxSizing: 'border-box'
                }}
            >
                <div
                    style={{
                        maxWidth: '1200px',
                        width: '90%',
                        borderRadius: '12px',
                        padding: '30px',
                        color: '#111111',
                        overflowY: 'auto',
                        maxHeight: '80vh'
                    }}
                >

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '30px'
                        }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,1)',
                                    padding: '30px',
                                    borderRadius: '8px',
                                    transition: 'transform 0.3s ease-in-out'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                <h3 style={{ marginBottom: '8px' }}>{item.title}</h3>
                                <p style={{ marginBottom: '12px' }}>{item.description}</p>
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: '#00aaff',
                                        textDecoration: 'none',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Read more
                                </a>

                            </div>
                        )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
