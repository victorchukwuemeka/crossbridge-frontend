import React from 'react';

const BridgeStatus = () => {
  return (
    <div className="bridge-status">
      <h2>Bridge Status</h2>
      <ul className="status-list">
        <li>Real-time balance updates</li>
        <li>Connected to Solana Devnet</li>
        <li>Estimated time: ~10 seconds</li>
      </ul>
    </div>
  );
};

export default BridgeStatus;