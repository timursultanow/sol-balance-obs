import React from 'react';
import { SolanaWidget } from './components/SolanaWidget';

function App() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'transparent'
    }}>
      <SolanaWidget 
        walletAddress="E6eHfFSmD6Ed19hWfLdLe1tqgryJwwARK66arkNBMEnx"
        initialBalance={0}
      />
    </div>
  );
}

export default App; 