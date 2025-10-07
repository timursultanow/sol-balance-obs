import React, { useEffect, useState } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { ethers } from 'ethers';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatAnimation = keyframes`
  0% {
    transform: translate(var(--x), var(--y)) scale(0);
    opacity: 0;
  }
  15% {
    transform: translate(var(--x), var(--y)) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translate(
      calc(var(--x) + var(--drift-x)), 
      calc(var(--y) + var(--drift-y))
    ) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(var(--x) + var(--drift-x)), 
      calc(var(--y) + var(--drift-y))
    ) scale(0);
    opacity: 0;
  }
`;

const WidgetContainer = styled.div<{ 
  isProfitNegative?: boolean; 
  isZero?: boolean;
  profitPercentage: number;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25px;
  background: rgba(26, 27, 38, 0.95);
  border-radius: 12px;
  padding: 10px 20px;
  color: white;
  width: 320px;
  height: 70px;
  position: relative;
  backdrop-filter: blur(10px);
  font-family: 'Inter', sans-serif;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    padding: 2px;
    background: ${props => {
      if (props.isZero) {
        return 'linear-gradient(45deg, #f3ba2f 0%, #ffd700 50%, #f3ba2f 100%)';
      }
      return props.isProfitNegative
        ? 'linear-gradient(45deg, #f3ba2f 0%, #ff6b6b 50%, #f3ba2f 100%)'
        : 'linear-gradient(45deg, #f3ba2f 0%, #4ecdc4 50%, #f3ba2f 100%)';
    }};
    background-size: 200% 200%;
    animation: ${gradientAnimation} 3s ease infinite;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: ${props => {
      if (props.isZero) return 'none';

      const percentage = props.profitPercentage;
      let intensity;

      if (props.isProfitNegative) {
        // Для убытков (до -50%)
        if (percentage <= -50) intensity = 0.5;
        else if (percentage <= -30) intensity = 0.4;
        else if (percentage <= -20) intensity = 0.3;
        else if (percentage <= -10) intensity = 0.2;
        else if (percentage <= -5) intensity = 0.15;
        else intensity = 0.1;
      } else {
        // Для прибыли (до +100%)
        if (percentage >= 100) intensity = 0.5;
        else if (percentage >= 50) intensity = 0.4;
        else if (percentage >= 30) intensity = 0.3;
        else if (percentage >= 20) intensity = 0.25;
        else if (percentage >= 10) intensity = 0.2;
        else if (percentage >= 5) intensity = 0.15;
        else intensity = 0.1;
      }

      const color = props.isProfitNegative ? '255, 107, 107' : '78, 205, 196';
      
      return `
        linear-gradient(135deg, 
          rgba(${color}, ${intensity}) 0%,
          rgba(243, 186, 47, 0) 35%,
          rgba(243, 186, 47, 0) 65%,
          rgba(${color}, ${intensity}) 100%
        )
      `;
    }};
    background-size: 200% 200%;
    animation: ${gradientAnimation} 4s ease-in-out infinite;
    transition: background 0.3s ease-in-out;
  }

  & > * {
    z-index: 2;
  }
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 120px;
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;
  padding: 5px 0;

  &:first-child::after {
    content: '';
    position: absolute;
    right: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 40px;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(243, 186, 47, 0.3),
      transparent
    );
  }
`;

const BnbIcon = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3ba2f 0%, #ffd700 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  color: #000;
  margin-right: 4px;
  flex-shrink: 0;
  
  &::before {
    content: 'B';
    font-family: 'Inter', sans-serif;
  }
`;

const Value = styled.div<{ isProfit?: boolean; isProfitNegative?: boolean; isZero?: boolean }>`
  font-family: 'Space Mono', monospace;
  font-size: 26px;
  font-weight: 700;
  color: ${props => {
    if (!props.isProfit) return '#ffd700';
    if (props.isZero) return '#f3ba2f';
    return props.isProfitNegative ? '#ff6b6b' : '#4ecdc4';
  }};
  transition: color 0.3s ease, transform 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  line-height: 1;

  &:hover {
    transform: scale(1.02);
  }
`;

const UsdValue = styled.div<{ isProfit?: boolean; isProfitNegative?: boolean; isZero?: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    if (!props.isProfit) return '#ffd700';
    if (props.isZero) return '#f3ba2f';
    return props.isProfitNegative ? '#ff6b6b' : '#4ecdc4';
  }};
  opacity: 0.8;
  margin-top: 2px;
`;

const EmojiParticle = styled.div`
  position: absolute;
  font-size: 36px;
  pointer-events: none;
  animation: ${floatAnimation} 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  z-index: 10;
  will-change: transform;
  user-select: none;
`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Mono:wght@400;700&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
  }
`;

interface EmojiParticle {
  id: number;
  emoji: string;
  style: React.CSSProperties;
}

interface Props {
  walletAddress: string;
  initialBalance?: number;
}

export const BnbWidget: React.FC<Props> = ({ 
  walletAddress, 
  initialBalance = 0 
}) => {
  const [balance, setBalance] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [initialPoint, setInitialPoint] = useState<number>(initialBalance);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emojis, setEmojis] = useState<EmojiParticle[]>([]);
  const [lastBalance, setLastBalance] = useState<number>(0);
  const [lastBalanceUpdateTime, setLastBalanceUpdateTime] = useState<number>(0);
  const [bnbPrice, setBnbPrice] = useState<number>(0);

  console.log('BnbWidget rendered with walletAddress:', walletAddress);

  const happyEmojis = ['🚀', '💎', '💰', '🔥', '⚡', '💫', '🌟', '🎯', '🏆', '💪'];
  const sadEmojis = ['😢', '😭', '😩', '😫', '😰', '😣', '😖', '🥺', '😿', '😾'];

  const createEmojiParticles = (isPositiveChange: boolean) => {
    const now = Date.now();
    if (now - lastBalanceUpdateTime < 3000) {
      return;
    }
    setLastBalanceUpdateTime(now);

    const selectedEmojis = isPositiveChange ? happyEmojis : sadEmojis;
    const gridSize = { x: 7, y: 3 };
    const newEmojis: EmojiParticle[] = [];
    
    for (let i = 0; i < gridSize.x; i++) {
      for (let j = 0; j < gridSize.y; j++) {
        const x = (i / (gridSize.x - 1)) * 280 - 140;
        const y = (j / (gridSize.y - 1)) * 50 - 25;
        
        const randomOffset = 15;
        const initialX = x + (Math.random() - 0.5) * randomOffset;
        const initialY = y + (Math.random() - 0.5) * randomOffset;
        
        const drift = 20;
        const driftX = (Math.random() - 0.5) * drift;
        const driftY = (Math.random() - 0.5) * drift;

        newEmojis.push({
          id: now + (i * gridSize.y + j),
          emoji: selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)],
          style: {
            '--x': `${initialX}px`,
            '--y': `${initialY}px`,
            '--drift-x': `${driftX}px`,
            '--drift-y': `${driftY}px`,
            left: '50%',
            top: '50%',
          } as React.CSSProperties,
        });
      }
    }

    setEmojis(newEmojis);
    setTimeout(() => setEmojis([]), 3000);
  };

  const resetProfit = () => {
    console.log('Сбрасываем точку отсчета профита на текущий баланс:', balance);
    setInitialPoint(balance);
    setProfit(0);
  };

  const fetchBnbPrice = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
      const data = await response.json();
      setBnbPrice(parseFloat(data.price));
    } catch (error) {
      console.error('Ошибка получения цены BNB:', error);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered for walletAddress:', walletAddress);
    let isMounted = true;
    let provider: ethers.JsonRpcProvider;

    try {
      // Используем публичный RPC для BSC
      provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org/');
      console.log('Provider created successfully');
    } catch (err) {
      console.error('Ошибка создания провайдера:', err);
      setError('Ошибка подключения к сети BSC');
      setIsLoading(false);
      return;
    }

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      console.log('Получаем баланс BNB для адреса:', walletAddress);
      
      // Проверяем, что адрес валидный
      if (!ethers.isAddress(walletAddress)) {
        throw new Error('Неверный адрес кошелька');
      }
      
      const balance = await provider.getBalance(walletAddress);
      let bnbBalance = parseFloat(ethers.formatEther(balance));
      
      // Для демонстрации: если баланс очень большой, показываем маленький
      if (bnbBalance > 1000) {
        bnbBalance = 1.234; // Демо-баланс
      }
        
        if (isMounted) {
          console.log('Баланс получен успешно:', bnbBalance, 'BNB');
          
          if (bnbBalance !== lastBalance) {
            const isPositiveChange = bnbBalance > lastBalance;
            setBalance(bnbBalance);
            const newProfit = bnbBalance - initialPoint;
            console.log('Обновляем профит:', newProfit, '(баланс:', bnbBalance, '- точка отсчета:', initialPoint, ')');
            setProfit(newProfit);
            setLastBalance(bnbBalance);
            
            createEmojiParticles(isPositiveChange);
          }
          
          setError(null);
        }
      } catch (error) {
        console.error('Ошибка при получении баланса:', error);
        if (isMounted) {
          setError('Ошибка получения баланса: ' + (error as Error).message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBalance();
    fetchBnbPrice();
    const interval = setInterval(fetchBalance, 3000); // Обновляем каждые 3 секунды
    const priceInterval = setInterval(fetchBnbPrice, 30000); // Обновляем цену каждые 30 секунд

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(priceInterval);
    };
  }, [walletAddress, initialPoint]);

  // Вычисляем процент изменения относительно начальной точки
  const profitPercentage = initialPoint > 0 ? (profit / initialPoint) * 100 : 0;

  // Если есть ошибка, показываем ее
  if (error) {
    return (
      <>
        <GlobalStyle />
        <WidgetContainer 
          isProfitNegative={false}
          isZero={true}
          profitPercentage={0}
        >
          <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
            <div style={{ fontSize: '14px', marginBottom: '5px' }}>Ошибка</div>
            <div style={{ fontSize: '12px' }}>{error}</div>
          </div>
        </WidgetContainer>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <WidgetContainer 
        isProfitNegative={profit < 0}
        isZero={profit === 0}
        profitPercentage={profitPercentage}
      >
        {emojis.map(({ id, emoji, style }) => (
          <EmojiParticle key={id} style={style}>
            {emoji}
          </EmojiParticle>
        ))}
        <ValueContainer>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BnbIcon />
            <Value>
              {isLoading ? '...' : error ? '???' : balance.toFixed(3)}
            </Value>
          </div>
          <UsdValue>
            {isLoading || error || bnbPrice === 0 ? '...' : `$${(balance * bnbPrice).toFixed(2)}`}
          </UsdValue>
        </ValueContainer>
        <ValueContainer>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BnbIcon />
            <Value 
              isProfit 
              isProfitNegative={profit < 0}
              isZero={profit === 0}
              onClick={resetProfit}
            >
              {isLoading
                ? '...'
                : error
                ? '???'
                : profit === 0
                ? '0.000'
                : `${profit > 0 ? '+' : ''}${profit.toFixed(3)}`}
            </Value>
          </div>
          <UsdValue 
            isProfit 
            isProfitNegative={profit < 0}
            isZero={profit === 0}
          >
            {isLoading || error || bnbPrice === 0 
              ? '...' 
              : profit === 0 
              ? '$0.00'
              : `${profit > 0 ? '+' : ''}$${(profit * bnbPrice).toFixed(2)}`}
          </UsdValue>
        </ValueContainer>
      </WidgetContainer>
    </>
  );
};
