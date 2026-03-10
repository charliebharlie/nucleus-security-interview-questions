import React, { useState } from 'react';
import './App.css'; // Import the external CSS

interface CalcResponse {
  result?: number;
  error?: string;
}

const App: React.FC = () => {
  const [display, setDisplay] = useState<string>("0");
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNumber = (num: string) => {
    setError(null);
    setDisplay(prev => (prev === "0" || prev === "Error") ? num : prev + num);
  };

  const handleOperator = (op: string) => {
    setOperator(op);
    setPrevValue(display);
    setDisplay("0");
  };

  const calculate = async () => {
    if (!operator || !prevValue) return;

    try {
      const response = await fetch('http://localhost:8080/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num1: prevValue, num2: display, operator }),
      });

      const data: CalcResponse = await response.json();

      if (response.ok && data.result !== undefined) {
        setDisplay(data.result.toString());
        setError(null);
      } else {
        setError(data.error || "Calculation failed");
        setDisplay("Error");
      }

      setOperator(null);
      setPrevValue(null);
    } catch (err) {
      setError("Server unreachable. Is the backend running?");
    }
  };

  return (
    <div className="app-container">
      <div className="calc-card">
        {error && <div className="error-banner">{error}</div>}
        <div className="display-screen">{display}</div>

        <div className="btn-grid">
          {[7, 8, 9].map(n => <button key={n} className="num-btn" onClick={() => handleNumber(n.toString())}>{n}</button>)}
          <button className="op-btn" onClick={() => handleOperator('/')}>÷</button>

          {[4, 5, 6].map(n => <button key={n} className="num-btn" onClick={() => handleNumber(n.toString())}>{n}</button>)}
          <button className="op-btn" onClick={() => handleOperator('*')}>×</button>

          {[1, 2, 3].map(n => <button key={n} className="num-btn" onClick={() => handleNumber(n.toString())}>{n}</button>)}
          <button className="op-btn" onClick={() => handleOperator('-')}>−</button>

          <button className="num-btn" onClick={() => handleNumber('0')}>0</button>
          <button className="num-btn" onClick={() => handleNumber('.')}>.</button>
          <button className="op-btn" onClick={() => handleOperator('+')}>+</button>
          <button className="op-btn" style={{ visibility: 'hidden' }}></button>

          <button className="clear-btn" onClick={() => { setDisplay("0"); setError(null); }}>CLEAR</button>
          <button className="equal-btn" onClick={calculate}>=</button>
        </div>
      </div>
    </div>
  );
};

export default App;
