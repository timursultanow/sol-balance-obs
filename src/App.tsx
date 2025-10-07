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
        walletAddress="0x28C6c06298d514Db089934071355E5743bf21d60"
        initialBalance={0}
      />
    </div>
  );
}

export default App; 