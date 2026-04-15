import { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  getSum,
  getMin,
  getMax,
  getCompare,
  getState,
  getReset,
  postUpdate,
  postArray
} from './api';

function CustomCursor({ accent }) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 18, stiffness: 300, mass: 0.5 };
  const trailX = useSpring(cursorX, springConfig);
  const trailY = useSpring(cursorY, springConfig);

  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const check = (e) => {
      setHovering(!!e.target.closest('button, a, input, [data-hover]'));
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousemove', check);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousemove', check);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, [cursorX, cursorY]);

  const dotSize = clicking ? 6 : 10;
  const blobSize = hovering ? 300 : 80;

  return (
    <>
      {/* Dot — follows mouse exactly */}
      <motion.div
        style={{
          position: 'fixed',
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        <motion.div
          animate={{ width: dotSize, height: dotSize }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          style={{
            borderRadius: '50%',
            background: accent,
          }}
        />
      </motion.div>

      {/* Blob — trails with spring physics, blurred on hover */}
      <motion.div
        style={{
          position: 'fixed',
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      >
        <motion.div
          animate={{
            width: blobSize,
            height: blobSize,
            opacity: hovering ? 0.15 : 0.2,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            borderRadius: '50%',
            background: accent,
            filter: hovering ? 'blur(50px)' : 'blur(16px)',
            transition: 'filter 0.3s ease, background 0.4s ease',
          }}
        />
      </motion.div>
    </>
  );
}

const themes = {
  ember: {
    name: 'Ember',
    bg: '#fafaf8', white: '#ffffff', dark: '#141210', dark2: '#2a2825',
    muted: '#78756e', faint: '#b5b1aa', line: '#e8e5df',
    accent: '#e8620a', accentLight: '#fff3eb',
    navBg: '#141210', navText: '#ffffff',
  },
  ocean: {
    name: 'Ocean',
    bg: '#f4f7fb', white: '#ffffff', dark: '#0f1b2d', dark2: '#1a2a42',
    muted: '#5a7090', faint: '#9ab0cc', line: '#d8e3ef',
    accent: '#1a6bdb', accentLight: '#eaf1fd',
    navBg: '#0f1b2d', navText: '#ffffff',
  },
  forest: {
    name: 'Forest',
    bg: '#f5f8f5', white: '#ffffff', dark: '#12201a', dark2: '#1e352a',
    muted: '#5e7a6a', faint: '#9bb5a6', line: '#d4e2d9',
    accent: '#1a8a52', accentLight: '#eaf7f0',
    navBg: '#12201a', navText: '#ffffff',
  },
  grape: {
    name: 'Grape',
    bg: '#f8f5fc', white: '#ffffff', dark: '#1a1028', dark2: '#2d2044',
    muted: '#7a6a90', faint: '#b5a6cc', line: '#e2d8ef',
    accent: '#7c3aed', accentLight: '#f3edff',
    navBg: '#1a1028', navText: '#ffffff',
  },
  midnight: {
    name: 'Midnight',
    bg: '#0e1117', white: '#1a1e27', dark: '#e6e8ec', dark2: '#c8ccd4',
    muted: '#8b919e', faint: '#4a5060', line: '#262c38',
    accent: '#3b82f6', accentLight: '#1c2536',
    navBg: '#080a0f', navText: '#e6e8ec',
  },
  rose: {
    name: 'Rose',
    bg: '#fdf5f5', white: '#ffffff', dark: '#2a1215', dark2: '#44201e',
    muted: '#907070', faint: '#cca8a8', line: '#eed8d8',
    accent: '#d63a4a', accentLight: '#fdeaec',
    navBg: '#2a1215', navText: '#ffffff',
  },
};

function App() {
  const [array, setArray] = useState([]);
  const [arrayInput, setArrayInput] = useState('');
  const [l, setL] = useState(0);
  const [r, setR] = useState(0);
  const [updateVal, setUpdateVal] = useState(0);
  const [result, setResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('query');
  const [theme, setTheme] = useState('ember');

  const t = themes[theme];

  useEffect(() => { fetchState(); }, []);

  const fetchState = async () => {
    try { const res = await getState(); setArray(res.data.array || []); }
    catch { setError('Failed to fetch array state'); }
  };
  const handleQuery = async (type) => {
    setError(null); setCompareResult(null); setLoading(true);
    try {
      let res;
      if (type === 'sum') { res = await getSum(l, r); setResult({ type: 'Sum', value: res.data.result, range: [l, r] }); }
      else if (type === 'min') { res = await getMin(l, r); setResult({ type: 'Min', value: res.data.result, range: [l, r] }); }
      else if (type === 'max') { res = await getMax(l, r); setResult({ type: 'Max', value: res.data.result, range: [l, r] }); }
    } catch (err) { setError(err.response?.data?.error || 'Query failed'); }
    setLoading(false);
  };
  const handleCompare = async () => {
    setError(null); setResult(null); setLoading(true);
    try { const res = await getCompare(l, r); setCompareResult(res.data); }
    catch (err) { setError(err.response?.data?.error || 'Compare failed'); }
    setLoading(false);
  };
  const handleUpdate = async () => {
    setError(null); setLoading(true);
    try {
      await postUpdate(l, r, updateVal); await fetchState();
      setResult({ type: 'Update', message: `Added ${updateVal} to range [${l}, ${r}]`, range: [l, r] });
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
    setLoading(false);
  };
  const handleSetArray = async () => {
    setError(null);
    try {
      const newArray = arrayInput.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      if (newArray.length === 0) { setError('Invalid array format'); return; }
      await postArray(newArray); setArray(newArray); setArrayInput('');
      setL(0); setR(Math.max(0, newArray.length - 1));
    } catch (err) { setError(err.response?.data?.error || 'Failed to set array'); }
  };
  const handleReset = async () => {
    setError(null);
    try { await getReset(); await fetchState(); setResult(null); setCompareResult(null); }
    catch { setError('Reset failed'); }
  };

  const sans = "'Outfit', system-ui, sans-serif";
  const mono = "'IBM Plex Mono', monospace";

  const errBg = '#fef2f2'; const errText = '#c0392b';
  const succBg = '#f0faf4'; const succText = '#1a7a45';

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.dark, fontFamily: sans, transition: 'background 0.4s ease, color 0.4s ease', cursor: 'none' }}>
      <CustomCursor accent={t.accent} />

      {/* ═══ TOP BAR ═══ */}
      <header style={{
        background: t.navBg, color: t.navText, position: 'sticky', top: 0, zIndex: 50,
        transition: 'background 0.4s ease',
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto', padding: '0 48px',
          height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', background: t.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.75rem', color: '#fff', letterSpacing: '0.06em',
              transition: 'background 0.4s ease',
            }}>ST</div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>SegTree</span>
            <span style={{ color: `${t.navText}60`, fontWeight: 400, fontSize: '0.85rem' }}>Aggregation Handler</span>
          </div>

          {/* Theme switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {Object.entries(themes).map(([key, th]) => (
              <button key={key} onClick={() => setTheme(key)}
                title={th.name}
                style={{
                  width: theme === key ? '28px' : '20px',
                  height: theme === key ? '28px' : '20px',
                  borderRadius: '50%',
                  background: th.accent,
                  border: theme === key ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: theme === key ? `0 0 12px ${th.accent}60` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>

        {/* ═══ HERO ═══ */}
        <div style={{ padding: '56px 0 0', animation: 'enter 0.6s ease-out both' }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900,
            lineHeight: 0.95, letterSpacing: '-0.04em', margin: 0, color: t.dark,
            transition: 'color 0.4s ease',
          }}>
            Segment<br/>
            <span style={{ color: t.accent, transition: 'color 0.4s ease' }}>Tree</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: t.muted, marginTop: '16px', maxWidth: '440px', lineHeight: 1.6, fontWeight: 400, transition: 'color 0.4s ease' }}>
            Range queries and lazy propagation updates, cross-validated with MongoDB.
          </p>
        </div>

        {/* ═══ WHAT IS A SEGMENT TREE ═══ */}
        <section style={{
          marginTop: '40px',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px',
          animation: 'enter 0.6s ease-out 0.08s both',
        }}>
          {[
            {
              title: 'What is a Segment Tree?',
              text: 'A binary tree data structure used for storing intervals or segments. It allows answering range queries (sum, min, max) over an array in O(log n) time, and updating elements efficiently.',
            },
            {
              title: 'Lazy Propagation',
              text: 'An optimization that delays updates to child nodes until they are actually needed. Instead of updating every node immediately, changes are stored and propagated later — making range updates O(log n) instead of O(n).',
            },
            {
              title: 'Why use it?',
              text: 'Brute force range queries take O(n) per query. With a segment tree, you get O(log n) queries and updates while using O(n) space. Ideal for competitive programming, databases, and real-time analytics.',
            },
          ].map((card, i) => (
            <div key={i} style={{
              background: t.white, borderRadius: '16px', padding: '28px',
              border: `1px solid ${t.line}`, transition: 'all 0.4s ease',
            }}>
              <div style={{
                fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: t.accent, marginBottom: '10px',
                transition: 'color 0.4s ease',
              }}>0{i + 1}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: t.dark, marginBottom: '10px', lineHeight: 1.3, transition: 'color 0.4s ease' }}>{card.title}</h3>
              <p style={{ fontSize: '0.82rem', color: t.muted, lineHeight: 1.65, margin: 0, transition: 'color 0.4s ease' }}>{card.text}</p>
            </div>
          ))}
        </section>

        {/* ═══ COMPLEXITY TABLE ═══ */}
        <section style={{
          marginTop: '16px', padding: '28px 36px',
          background: t.white, borderRadius: '16px', border: `1px solid ${t.line}`,
          animation: 'enter 0.6s ease-out 0.12s both',
          transition: 'all 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: t.dark, transition: 'color 0.4s ease' }}>Time Complexity</span>
            <span style={{ fontSize: '0.72rem', color: t.muted, transition: 'color 0.4s ease' }}>Segment Tree vs Brute Force</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${t.line}`, transition: 'border-color 0.4s ease' }}>
            {/* Header */}
            {['Operation', 'Segment Tree', 'Brute Force'].map(h => (
              <div key={h} style={{
                padding: '10px 16px', background: t.accentLight,
                fontFamily: mono, fontSize: '0.68rem', fontWeight: 600, color: t.accent,
                letterSpacing: '0.04em', transition: 'all 0.4s ease',
              }}>{h}</div>
            ))}
            {/* Rows */}
            {[
              ['Build', 'O(n)', 'O(1)'],
              ['Range Query (Sum/Min/Max)', 'O(log n)', 'O(n)'],
              ['Point Update', 'O(log n)', 'O(1)'],
              ['Range Update (Lazy)', 'O(log n)', 'O(n)'],
              ['Space', 'O(4n)', 'O(n)'],
            ].map((row, i) => (
              row.map((cell, j) => (
                <div key={`${i}-${j}`} style={{
                  padding: '10px 16px',
                  borderTop: `1px solid ${t.line}`,
                  fontFamily: j > 0 ? mono : sans,
                  fontSize: j > 0 ? '0.78rem' : '0.82rem',
                  fontWeight: j > 0 ? 600 : 500,
                  color: j === 1 ? t.accent : j === 2 ? t.muted : t.dark,
                  transition: 'all 0.4s ease',
                }}>{cell}</div>
              ))
            ))}
          </div>
        </section>

        {/* ═══ ARRAY ═══ */}
        <section style={{
          marginTop: '16px', padding: '36px 40px',
          background: t.white, borderRadius: '20px', border: `1px solid ${t.line}`,
          animation: 'enter 0.6s ease-out 0.16s both',
          transition: 'all 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: t.dark }}>Array</span>
              <span style={{ fontFamily: mono, fontSize: '0.7rem', color: t.faint, background: t.bg, padding: '2px 10px', borderRadius: '4px' }}>{array.length}</span>
            </div>
            <button onClick={handleReset} style={{
              fontFamily: sans, fontSize: '0.78rem', fontWeight: 600, color: t.muted,
              background: 'none', border: `1.5px solid ${t.line}`, borderRadius: '8px',
              padding: '7px 18px', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = t.accent; e.target.style.color = t.accent; }}
              onMouseLeave={e => { e.target.style.borderColor = t.line; e.target.style.color = t.muted; }}
            >Reset</button>
          </div>

          {array.length > 0 ? (
            <>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {array.map((val, idx) => {
                  const active = idx >= l && idx <= r;
                  return (
                    <div key={idx} style={{
                      width: '80px', background: active ? t.accent : t.bg,
                      borderRadius: '14px', padding: '16px 0 12px', textAlign: 'center',
                      transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', cursor: 'default',
                      border: active ? `2px solid ${t.accent}` : `1.5px solid ${t.line}`,
                      transform: active ? 'translateY(-3px)' : 'none',
                      boxShadow: active ? `0 6px 20px ${t.accent}30` : 'none',
                    }}>
                      <div style={{
                        fontFamily: sans, fontSize: '1.7rem', fontWeight: 800,
                        color: active ? '#fff' : t.dark, lineHeight: 1,
                      }}>{val}</div>
                      <div style={{
                        fontFamily: mono, fontSize: '0.6rem', fontWeight: 600,
                        color: active ? 'rgba(255,255,255,0.65)' : t.faint, marginTop: '6px',
                      }}>[{idx}]</div>
                    </div>
                  );
                })}
              </div>
              <div style={{
                marginTop: '20px', height: '6px', borderRadius: '3px',
                background: t.bg, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, borderRadius: '3px',
                  left: `${(l / Math.max(array.length - 1, 1)) * 100}%`,
                  width: `${(Math.max(r - l, 0) / Math.max(array.length - 1, 1)) * 100}%`,
                  height: '100%', background: t.accent, transition: 'all 0.3s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontFamily: mono, fontSize: '0.65rem', color: t.faint }}>L = {l}</span>
                <span style={{ fontFamily: mono, fontSize: '0.65rem', color: t.faint }}>R = {r}</span>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: t.faint, fontSize: '0.9rem', border: `1.5px dashed ${t.line}`, borderRadius: '14px' }}>No array loaded</div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <input type="text" value={arrayInput} onChange={e => setArrayInput(e.target.value)}
              placeholder="New array: 2, 5, 1, 4, 9, 3"
              style={{
                flex: 1, padding: '11px 16px', borderRadius: '10px',
                border: `1.5px solid ${t.line}`, background: t.bg, color: t.dark,
                fontFamily: mono, fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = t.accent; }}
              onBlur={e => { e.target.style.borderColor = t.line; }}
            />
            <button onClick={handleSetArray} style={{
              fontFamily: sans, fontSize: '0.82rem', fontWeight: 700,
              color: t.navText, background: t.dark, border: 'none', borderRadius: '10px',
              padding: '11px 24px', cursor: 'pointer', transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => { e.target.style.opacity = '0.8'; }}
              onMouseLeave={e => { e.target.style.opacity = '1'; }}
            >Set Array</button>
          </div>
        </section>

        {/* ═══ OPERATIONS ═══ */}
        <section style={{
          marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
          animation: 'enter 0.6s ease-out 0.2s both',
        }}>
          {/* LEFT: Controls */}
          <div style={{ background: t.white, borderRadius: '20px', padding: '36px 40px', border: `1px solid ${t.line}`, transition: 'all 0.4s ease' }}>
            <span style={{ fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: t.dark, display: 'block', marginBottom: '24px' }}>Operations</span>

            <div style={{ display: 'flex', gap: '0', marginBottom: '28px', borderBottom: `2px solid ${t.line}` }}>
              {['query', 'update', 'compare'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  fontFamily: sans, fontSize: '0.85rem', fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? t.accent : t.muted,
                  background: 'none', border: 'none',
                  borderBottom: activeTab === tab ? `2px solid ${t.accent}` : '2px solid transparent',
                  padding: '0 0 12px 0', marginRight: '28px', marginBottom: '-2px',
                  cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                }}>{tab}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'update' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Left (L)', value: l, set: e => setL(parseInt(e.target.value) || 0), show: true },
                { label: 'Right (R)', value: r, set: e => setR(parseInt(e.target.value) || 0), show: true },
                { label: 'Value', value: updateVal, set: e => setUpdateVal(parseInt(e.target.value) || 0), show: activeTab === 'update' },
              ].filter(f => f.show).map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: t.muted, marginBottom: '6px' }}>{f.label}</label>
                  <input type="number" value={f.value} onChange={f.set} min={0} max={array.length - 1}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '10px',
                      border: `1.5px solid ${t.line}`, background: t.bg, color: t.dark,
                      fontFamily: mono, fontSize: '1rem', fontWeight: 600,
                      outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = t.accent; }}
                    onBlur={e => { e.target.style.borderColor = t.line; }}
                  />
                </div>
              ))}
            </div>

            {activeTab === 'query' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {['sum', 'min', 'max'].map(type => (
                  <button key={type} onClick={() => handleQuery(type)} disabled={loading} style={{
                    flex: 1, padding: '13px 0', borderRadius: '10px',
                    border: 'none', background: t.accent, color: '#fff',
                    fontFamily: sans, fontSize: '0.9rem', fontWeight: 700,
                    cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1,
                    transition: 'all 0.15s', textTransform: 'capitalize',
                  }}
                    onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                  >{type}</button>
                ))}
              </div>
            )}
            {activeTab === 'update' && (
              <button onClick={handleUpdate} disabled={loading} style={{
                width: '100%', padding: '13px 0', borderRadius: '10px',
                border: 'none', background: t.accent, color: '#fff',
                fontFamily: sans, fontSize: '0.9rem', fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
              >Update Range (+{updateVal})</button>
            )}
            {activeTab === 'compare' && (
              <button onClick={handleCompare} disabled={loading} style={{
                width: '100%', padding: '13px 0', borderRadius: '10px',
                border: `2px solid ${t.dark}`, background: 'transparent', color: t.dark,
                fontFamily: sans, fontSize: '0.9rem', fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!loading) { e.target.style.background = t.dark; e.target.style.color = t.navText; }}}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = t.dark; }}
              >Compare ST vs MongoDB</button>
            )}
          </div>

          {/* RIGHT: Result */}
          <div style={{ background: t.white, borderRadius: '20px', padding: '36px 40px', border: `1px solid ${t.line}`, display: 'flex', flexDirection: 'column', transition: 'all 0.4s ease' }}>
            <span style={{ fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: t.dark, display: 'block', marginBottom: '24px' }}>Result</span>

            {error && (
              <div style={{ padding: '14px 18px', borderRadius: '12px', background: errBg, borderLeft: `4px solid ${errText}` }}>
                <span style={{ fontSize: '0.85rem', color: errText, fontWeight: 600 }}>{error}</span>
              </div>
            )}

            {result && !compareResult && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                  fontFamily: mono, fontSize: '0.65rem', fontWeight: 600, color: t.faint,
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px',
                }}>
                  {result.type === 'Update' ? 'Update Applied' : `${result.type} of [${result.range[0]}..${result.range[1]}]`}
                </div>
                {result.type === 'Update' ? (
                  <div style={{ padding: '14px 18px', borderRadius: '12px', background: succBg, borderLeft: `4px solid ${succText}` }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: succText }}>{result.message}</span>
                  </div>
                ) : (
                  <span style={{
                    fontFamily: sans, fontSize: '5rem', fontWeight: 900,
                    color: t.accent, lineHeight: 1, letterSpacing: '-0.04em',
                    transition: 'color 0.4s ease',
                  }}>{result.value}</span>
                )}
              </div>
            )}

            {compareResult && (
              <div style={{ flex: 1 }}>
                {compareResult.mongoDB === null && (
                  <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#fffbeb', borderLeft: '4px solid #b8860b', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>{compareResult.warning || 'MongoDB unavailable'} — ST results only</span>
                  </div>
                )}
                {['Sum', 'Min', 'Max'].map((label, i) => {
                  const key = label.toLowerCase();
                  const isMatch = compareResult.mongoDB && compareResult.match[key];
                  return (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 0', borderBottom: i < 2 ? `1px solid ${t.line}` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                        <span style={{ fontFamily: mono, fontSize: '0.65rem', fontWeight: 600, color: t.faint, width: '34px' }}>{label.toUpperCase()}</span>
                        <span style={{ fontFamily: sans, fontSize: '2rem', fontWeight: 800, color: t.accent }}>{compareResult.segmentTree[key]}</span>
                      </div>
                      {compareResult.mongoDB && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontFamily: mono, fontSize: '0.78rem', color: t.muted }}>mongo: {compareResult.mongoDB[key]}</span>
                          <span style={{
                            fontFamily: sans, fontSize: '0.65rem', fontWeight: 700,
                            padding: '3px 10px', borderRadius: '4px',
                            background: isMatch ? succBg : errBg, color: isMatch ? succText : errText,
                          }}>{isMatch ? 'MATCH' : 'DIFF'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!error && !result && !compareResult && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontFamily: sans, fontSize: '5rem', fontWeight: 900, color: t.line, lineHeight: 1, letterSpacing: '-0.04em' }}>?</span>
                <span style={{ fontSize: '0.85rem', color: t.faint, fontWeight: 500 }}>Run a query</span>
              </div>
            )}
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section style={{
          marginTop: '16px', padding: '32px 40px',
          background: t.white, borderRadius: '20px', border: `1px solid ${t.line}`,
          animation: 'enter 0.6s ease-out 0.24s both',
          transition: 'all 0.4s ease',
        }}>
          <span style={{ fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: t.dark, display: 'block', marginBottom: '20px' }}>How It Works</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: t.dark, marginBottom: '10px' }}>Tree Structure</h3>
              <p style={{ fontSize: '0.82rem', color: t.muted, lineHeight: 1.7, margin: '0 0 12px 0' }}>
                The array is stored at the leaf nodes. Each internal node stores the aggregate (sum, min, or max) of its children. The root holds the answer for the entire array.
              </p>
              <p style={{ fontSize: '0.82rem', color: t.muted, lineHeight: 1.7, margin: 0 }}>
                For an array of size <span style={{ fontFamily: mono, fontWeight: 600, color: t.accent }}>n</span>, the tree uses <span style={{ fontFamily: mono, fontWeight: 600, color: t.accent }}>4n</span> space and has height <span style={{ fontFamily: mono, fontWeight: 600, color: t.accent }}>O(log n)</span>.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: t.dark, marginBottom: '10px' }}>Query &amp; Update Flow</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { step: '1', text: 'User selects a range [L, R] and an operation' },
                  { step: '2', text: 'Tree traverses from root, pruning branches outside range' },
                  { step: '3', text: 'Nodes fully inside range return their stored value' },
                  { step: '4', text: 'Partial overlaps recurse into both children' },
                  { step: '5', text: 'Results merge back up to return the final answer' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{
                      fontFamily: mono, fontSize: '0.7rem', fontWeight: 700, color: t.accent,
                      background: t.accentLight, width: '24px', height: '24px', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'all 0.4s ease',
                    }}>{s.step}</span>
                    <span style={{ fontSize: '0.82rem', color: t.muted, lineHeight: 1.5 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ USE CASES ═══ */}
        <section style={{
          marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px',
          animation: 'enter 0.6s ease-out 0.28s both',
        }}>
          {[
            { title: 'Competitive Programming', desc: 'Range queries in contest problems' },
            { title: 'Database Indexing', desc: 'Interval-based lookups and aggregation' },
            { title: 'Graphics & Games', desc: 'Collision detection with spatial data' },
            { title: 'Real-time Analytics', desc: 'Sliding window aggregations on streams' },
          ].map((uc, i) => (
            <div key={i} style={{
              padding: '24px 20px', borderRadius: '14px',
              background: t.white, border: `1px solid ${t.line}`,
              transition: 'all 0.4s ease',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: t.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: mono, fontSize: '0.7rem', fontWeight: 700, color: t.accent,
                marginBottom: '12px', transition: 'all 0.4s ease',
              }}>{String(i + 1).padStart(2, '0')}</div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: t.dark, marginBottom: '6px', transition: 'color 0.4s ease' }}>{uc.title}</h4>
              <p style={{ fontSize: '0.76rem', color: t.muted, lineHeight: 1.55, margin: 0, transition: 'color 0.4s ease' }}>{uc.desc}</p>
            </div>
          ))}
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{
          padding: '24px 0 48px', marginTop: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.78rem', color: t.faint }}>Segment Tree with Lazy Propagation</span>
          <span style={{ fontFamily: mono, fontSize: '0.65rem', color: t.faint }}>Build O(n) / Query O(log n) / Update O(log n)</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
