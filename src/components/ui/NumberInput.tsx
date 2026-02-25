import { useState, useEffect } from 'react';
import './NumberInput.css';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberInput({ value, onChange, min, max, step = 0.1, suffix }: NumberInputProps) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    let num = parseFloat(inputValue);
    if (isNaN(num)) {
      num = value;
    }
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
    setInputValue(String(num));
    onChange(num);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const increment = () => {
    let newVal = value + step;
    if (max !== undefined && newVal > max) newVal = max;
    newVal = Math.round(newVal * 100) / 100;
    onChange(newVal);
  };

  const decrement = () => {
    let newVal = value - step;
    if (min !== undefined && newVal < min) newVal = min;
    newVal = Math.round(newVal * 100) / 100;
    onChange(newVal);
  };

  return (
    <div className="number-input">
      <button type="button" className="number-input-btn" onClick={decrement}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div className="number-input-field">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {suffix && <span className="number-input-suffix">{suffix}</span>}
      </div>
      <button type="button" className="number-input-btn" onClick={increment}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
