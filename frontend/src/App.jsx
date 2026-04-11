import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      const res = await getState();
      setArray(res.data.array || []);
    } catch (err) {
      setError('Failed to fetch array state');
    }
  };

  const handleQuery = async (type) => {
    setError(null);
    setCompareResult(null);
    setLoading(true);
    try {
      let res;
      switch (type) {
        case 'sum':
          res = await getSum(l, r);
          setResult({ type: 'Sum', value: res.data.result, range: [l, r] });
          break;
        case 'min':
          res = await getMin(l, r);
          setResult({ type: 'Min', value: res.data.result, range: [l, r] });
          break;
        case 'max':
          res = await getMax(l, r);
          setResult({ type: 'Max', value: res.data.result, range: [l, r] });
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Query failed');
    }
    setLoading(false);
  };

  const handleCompare = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await getCompare(l, r);
      setCompareResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Compare failed');
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    setError(null);
    setLoading(true);
    try {
      await postUpdate(l, r, updateVal);
      await fetchState();
      setResult({ type: 'Update', message: `Added ${updateVal} to range [${l}, ${r}]`, range: [l, r] });
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
    setLoading(false);
  };

  const handleSetArray = async () => {
    setError(null);
    try {
      const newArray = arrayInput.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      if (newArray.length === 0) {
        setError('Invalid array format');
        return;
      }
      await postArray(newArray);
      setArray(newArray);
      setArrayInput('');
      setL(0);
      setR(Math.max(0, newArray.length - 1));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set array');
    }
  };

  const handleReset = async () => {
    setError(null);
    try {
      await getReset();
      await fetchState();
      setResult(null);
      setCompareResult(null);
    } catch (err) {
      setError('Reset failed');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#fff',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '2.5rem',
      margin: '0 0 10px 0',
      background: 'linear-gradient(90deg, #00d9ff, #00ff88)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    card: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '15px',
      padding: '25px',
      marginBottom: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    input: {
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.1)',
      color: '#fff',
      fontSize: '1rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    button: {
      padding: '12px 25px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    primaryBtn: {
      background: 'linear-gradient(135deg, #00d9ff 0%, #00ff88 100%)',
      color: '#1a1a2e'
    },
    secondaryBtn: {
      background: 'rgba(255,255,255,0.1)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)'
    },
    resultBox: {
      background: 'rgba(0,255,136,0.1)',
      border: '1px solid #00ff88',
      borderRadius: '10px',
      padding: '20px',
      marginTop: '20px'
    },
    errorBox: {
      background: 'rgba(255,0,0,0.1)',
      border: '1px solid #ff4444',
      borderRadius: '10px',
      padding: '15px',
      marginTop: '15px',
      color: '#ff6b6b'
    },
    tabContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px'
    },
    tab: (active) => ({
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      background: active ? 'linear-gradient(135deg, #00d9ff 0%, #00ff88 100%)' : 'rgba(255,255,255,0.1)',
      color: active ? '#1a1a2e' : '#fff',
      transition: 'all 0.3s ease'
    }),
    arrayDisplay: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '15px'
    },
    arrayElement: (index, l, r) => ({
      padding: '10px 15px',
      borderRadius: '8px',
      background: index >= l && index <= r ? 'linear-gradient(135deg, #00d9ff 0%, #00ff88 100%)' : 'rgba(255,255,255,0.15)',
      color: index >= l && index <= r ? '#1a1a2e' : '#fff',
      fontWeight: '600',
      fontSize: '1.1rem'
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginTop: '15px'
    },
    statBox: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      padding: '15px',
      textAlign: 'center'
    },
    compareMatch: {
      color: '#00ff88',
      fontSize: '0.9rem',
      marginTop: '5px'
    },
    compareMismatch: {
      color: '#ff4444',
      fontSize: '0.9rem',
      marginTop: '5px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={styles.header}>
          <h1 style={styles.title}>Segment Tree Aggregation Handler</h1>
          <p style={{ color: '#aaa', margin: 0 }}>
            Range Queries with O(log n) complexity | Lazy Propagation Updates
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Current Array</h3>
          {array.length > 0 ? (
            <div style={styles.arrayDisplay}>
              {array.map((val, idx) => (
                <span key={idx} style={styles.arrayElement(idx, l, r)}>
                  {val}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#aaa' }}>No array loaded</p>
          )}
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleReset} style={{ ...styles.button, ...styles.secondaryBtn }}>
              Reset to Default
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Set New Array</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              placeholder="e.g., 1, 2, 3, 4, 5"
              style={{ ...styles.input, flex: 1, minWidth: '200px' }}
            />
            <button onClick={handleSetArray} style={{ ...styles.button, ...styles.primaryBtn }}>
              Set Array
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.tabContainer}>
            <button style={styles.tab(activeTab === 'query')} onClick={() => setActiveTab('query')}>
              Query
            </button>
            <button style={styles.tab(activeTab === 'update')} onClick={() => setActiveTab('update')}>
              Update
            </button>
            <button style={styles.tab(activeTab === 'compare')} onClick={() => setActiveTab('compare')}>
              Compare
            </button>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Left (L)</label>
              <input
                type="number"
                value={l}
                onChange={(e) => setL(parseInt(e.target.value) || 0)}
                min={0}
                max={array.length - 1}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Right (R)</label>
              <input
                type="number"
                value={r}
                onChange={(e) => setR(parseInt(e.target.value) || 0)}
                min={0}
                max={array.length - 1}
                style={styles.input}
              />
            </div>
            {activeTab === 'update' && (
              <div style={{ flex: 1, minWidth: '100px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Value</label>
                <input
                  type="number"
                  value={updateVal}
                  onChange={(e) => setUpdateVal(parseInt(e.target.value) || 0)}
                  style={styles.input}
                />
              </div>
            )}
          </div>

          {activeTab === 'query' && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => handleQuery('sum')} style={{ ...styles.button, ...styles.primaryBtn }} disabled={loading}>
                Sum
              </button>
              <button onClick={() => handleQuery('min')} style={{ ...styles.button, ...styles.primaryBtn }} disabled={loading}>
                Min
              </button>
              <button onClick={() => handleQuery('max')} style={{ ...styles.button, ...styles.primaryBtn }} disabled={loading}>
                Max
              </button>
            </div>
          )}

          {activeTab === 'update' && (
            <button onClick={handleUpdate} style={{ ...styles.button, ...styles.primaryBtn }} disabled={loading}>
              Update Range (+{updateVal})
            </button>
          )}

          {activeTab === 'compare' && (
            <button onClick={handleCompare} style={{ ...styles.button, ...styles.primaryBtn }} disabled={loading}>
              Compare Segment Tree vs MongoDB
            </button>
          )}

          {error && <div style={styles.errorBox}>{error}</div>}

          {result && !compareResult && (
            <div style={styles.resultBox}>
              <h3 style={{ margin: '0 0 10px 0', color: '#00ff88' }}>
                {result.type === 'Update' ? result.message : `${result.type} [${result.range[0]}, ${result.range[1]}]`}
              </h3>
              {result.type !== 'Update' && (
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{result.value}</p>
              )}
            </div>
          )}

          {compareResult && (
            <div style={styles.resultBox}>
              <h3 style={{ margin: '0 0 15px 0', color: '#00ff88' }}>
                Comparison for Range [{compareResult.range[0]}, {compareResult.range[1]}]
              </h3>
              {compareResult.mongoDB === null ? (
                <div style={{ padding: '15px', background: 'rgba(255, 200, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 200, 0, 0.3)', marginBottom: '15px' }}>
                  <p style={{ margin: 0, color: '#ffc800' }}>
                    ⚠️ {compareResult.warning || 'MongoDB is not available'}
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#888' }}>
                    Showing Segment Tree results only
                  </p>
                </div>
              ) : null}
              <div style={styles.grid}>
                <div style={styles.statBox}>
                  <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Sum</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {compareResult.segmentTree.sum}
                  </div>
                  {compareResult.mongoDB && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>MongoDB: {compareResult.mongoDB.sum}</div>
                      <div style={compareResult.match.sum ? styles.compareMatch : styles.compareMismatch}>
                        {compareResult.match.sum ? '✓ Match' : '✗ Mismatch'}
                      </div>
                    </>
                  )}
                </div>
                <div style={styles.statBox}>
                  <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Min</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {compareResult.segmentTree.min}
                  </div>
                  {compareResult.mongoDB && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>MongoDB: {compareResult.mongoDB.min}</div>
                      <div style={compareResult.match.min ? styles.compareMatch : styles.compareMismatch}>
                        {compareResult.match.min ? '✓ Match' : '✗ Mismatch'}
                      </div>
                    </>
                  )}
                </div>
                <div style={styles.statBox}>
                  <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Max</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {compareResult.segmentTree.max}
                  </div>
                  {compareResult.mongoDB && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>MongoDB: {compareResult.mongoDB.max}</div>
                      <div style={compareResult.match.max ? styles.compareMatch : styles.compareMismatch}>
                        {compareResult.match.max ? '✓ Match' : '✗ Mismatch'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: '#666', marginTop: '30px' }}>
          <p style={{ margin: '5px 0' }}>Segment Tree with Lazy Propagation</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Build: O(n) | Query: O(log n) | Update: O(log n)
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
