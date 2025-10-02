import React, { useState } from 'react';

interface AdminPortalProps {
  currentPrice: number;
  onPriceUpdate: (price: number) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentPrice, onPriceUpdate }) => {
  const [priceInput, setPriceInput] = useState(currentPrice);
  const [message, setMessage] = useState("");

  const handlePriceUpdate = () => {
    if (!isNaN(priceInput) && priceInput > 0) {
      onPriceUpdate(priceInput);
      setMessage("Snobol price updated.");
    } else {
      setMessage("Please enter a valid number.");
    }
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid gray", borderRadius: "8px" }}>
      <h2>🛠 Admin Panel</h2>
      <p>📈 Live Snobol Price: <strong>{currentPrice.toFixed(4)}</strong></p>
      <label>
        Edit Base Price:
        <input
          type="number"
          step="0.0001"
          value={priceInput}
          onChange={(e) => setPriceInput(parseFloat(e.target.value))}
          style={{ marginLeft: "1rem", padding: "0.5rem" }}
        />
      </label>
      <button onClick={handlePriceUpdate} style={{ marginLeft: "1rem", padding: "0.5rem" }}>
        Update
      </button>
      {message && <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>}
    </div>
  );
};