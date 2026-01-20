import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Galaxy from "../views/Galaxy";

type CommunityItem = {
    id: number;
    title: string;
    description: string;
    link: string | null;
};

export default function Community() {
    const [items, setItems] = useState<CommunityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/community');
                if (!res.ok) {
                    throw new Error('加载失败');
                }
                const data = await res.json();
                if (data.ok && Array.isArray(data.items)) {
                    setItems(data.items);
                } else {
                    throw new Error('数据格式错误');
                }
            } catch (e) {
                setError('无法获取学习交流中心内容');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

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
                    zIndex: 999,
                    marginTop: '3%',
                    height: '100%',
                    width: '100%',
                    gap: '30px',
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
                        padding: '40px',
                        color: '#111111',
                        overflowY: 'auto',
                        maxHeight: '80vh',
                    }}
                >

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '40px'
                        }}
                    >
                        {loading && (
                            <div style={{ color: '#ffffff' }}>加载中...</div>
                        )}
                        {!loading && error && (
                            <div style={{ color: '#ffffff' }}>{error}</div>
                        )}
                        {!loading && !error && items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,1)',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    transition: 'transform 0.3s ease-in-out',
                                    cursor: item.link ? 'pointer' : 'default',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                onClick={() => {
                                    navigate(`/community/${item.id}`);
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <img
                                        src="/images/study.png"
                                        className="community-study-icon-rotate"
                                        style={{ width: '50px', height: '50px', marginBottom: '8px' }}
                                        alt=""
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '24px' }}>
                                        <h3 style={{ marginBottom: '8px' }}>{item.title}</h3>
                                        <p style={{ marginBottom: '12px' }}>{item.description}</p>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        marginBottom: "10px",
                                        marginLeft: "85%",
                                        borderRadius: '999px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        color: '#111111',
                                    }}
                                >
                                    &gt;
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
