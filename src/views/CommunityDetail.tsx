import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import LightRays from '../component/LigntRays';

const API_BASE = process.env.REACT_APP_API_BASE || '';

type CommunityItem = {
  id: number;
  title: string;
  description: string;
  link: string | null;
};

type CommunityComment = {
  id: number;
  post_id: number;
  author: string;
  content: string;
  created_at: string;
};

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);

  const [item, setItem] = useState<CommunityItem | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!postId || Number.isNaN(postId)) {
        setError('无效的文章编号');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/community`);
        if (!res.ok) {
          throw new Error('加载文章失败');
        }
        const data = await res.json();
        if (!data.ok || !Array.isArray(data.items)) {
          throw new Error('文章数据格式错误');
        }
        const found = (data.items as CommunityItem[]).find(
          (it) => it.id === postId
        );
        if (!found) {
          setError('未找到对应文章');
          return;
        }
        setItem(found);

        if (found.link) {
          const mdRes = await fetch(found.link);
          if (mdRes.ok) {
            const text = await mdRes.text();
            setMarkdown(text);
          }
        }

        const cRes = await fetch(`${API_BASE}/api/community/comments?postId=${postId}`);
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.ok && Array.isArray(cData.comments)) {
            setComments(cData.comments as CommunityComment[]);
          }
        }
      } catch (e) {
        setError('加载文章失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cs_user');
      if (!raw) return;
      const user = JSON.parse(raw);
      if (user && typeof user.username === 'string') {
        setAuthor(user.username);
      }
    } catch {
    }
  }, []);

  const handleSubmitComment = async () => {
    const trimmed = content.trim();
    const name = author.trim() || '匿名';
    if (!trimmed) {
      setCommentError('评论内容不能为空');
      return;
    }
    setCommentSubmitting(true);
    setCommentError('');
    try {
      const res = await fetch(`${API_BASE}/api/community/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, author: name, content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setCommentError(data.message || '发表评论失败');
        return;
      }
      const created: CommunityComment = {
        id: Date.now(),
        post_id: postId,
        author: name,
        content: trimmed,
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [created, ...prev]);
      setContent('');
    } catch {
      setCommentError('网络错误，稍后重试');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', color: '#111111', background: '#020617', minHeight: '100vh' }}>
        正在加载...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#020617',
          color: '#e5e7eb',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1}
            lightSpread={0.5}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            className="custom-rays"
            pulsating={false}
            fadeDistance={1}
            saturation={1}
          />
        </div>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              marginBottom: '16px',
              padding: '6px 12px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            返回
          </button>
          {error || '未找到文章'}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020617',
        color: '#e5e7eb',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '16px',
            padding: '6px 12px',
            borderRadius: '999px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          返回
        </button>

        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            borderRadius: '12px',
            padding: '24px 28px',
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: '12px', fontSize: '28px' }}>
            {item.title}
          </h1>
          {item.description && (
            <p
              style={{
                marginTop: 0,
                marginBottom: '20px',
                color: '#9ca3af',
                fontSize: '14px',
              }}
            >
              {item.description}
            </p>
          )}

          <div
            style={{
              padding: '16px 0',
              marginBottom: '24px',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            {markdown ? (
              <ReactMarkdown>{markdown}</ReactMarkdown>
            ) : (
              <div style={{ color: '#9ca3af' }}>暂时没有文章内容</div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>评论</h2>
              <div style={{ marginBottom: '12px' }}>
                <button
                  onClick={handleSubmitComment}
                  disabled={commentSubmitting}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#0b1120',
                    cursor: commentSubmitting ? 'default' : 'pointer',
                    opacity: commentSubmitting ? 0.7 : 1,
                  }}
                >
                  {commentSubmitting ? '发送中...' : '发送评论'}
                </button>
              </div>
            </div>
            <textarea
              placeholder="写下你的评论..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #111111',
                fontSize: '14px',
                resize: 'vertical',
                backgroundColor: 'transparent',
                color: '#111111',
              }}
            />
            {commentError && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#f97316',
                }}
              >
                {commentError}
              </div>
            )}

            {comments.length > 0 && (
              <div
                style={{
                  marginTop: '16px',
                  borderTop: '1px solid #374151',
                  paddingTop: '8px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      fontSize: '14px',
                      marginBottom: '10px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: '2px',
                        color: '#f9fafb',
                      }}
                    >
                      {c.author || '匿名'}
                    </div>
                    <div style={{ color: '#d1d5db' }}>{c.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
