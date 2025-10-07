import React from 'react';
import { BnbWidget } from './components/BnbWidget';

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
      <BnbWidget 
        walletAddress="0x8894E0a0c962CB723c1976a4421c95949bE2D4E3"
        initialBalance={0}
      />
    </div>
  );
}

export default App; 