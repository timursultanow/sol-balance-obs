import React, { useEffect, useState } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { Connection, PublicKey, Commitment } from '@solana/web3.js';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Mono:wght@400;700&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
  }
`;

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

const borderPulse = keyframes`
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
`;

const energyFlow = keyframes`
  0% {
    transform: translateY(-100%) scale(1);
    opacity: 0;
  }
  20% {
    transform: translateY(-50%) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translateY(50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translateY(100%) scale(1);
    opacity: 0;
  }
`;

const glowPulse = keyframes`
  0% {
    filter: drop-shadow(0 0 4px rgba(122, 162, 247, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(122, 162, 247, 0.7));
  }
  100% {
    filter: drop-shadow(0 0 4px rgba(122, 162, 247, 0.3));
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const rotateAndBounce = keyframes`
  0% {
    transform: translateY(0) rotate(0deg) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translateY(-5px) rotate(20deg) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translateY(0) rotate(-10deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(5px) rotate(0deg) scale(0.5);
    opacity: 0;
  }
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

const EmojiParticle = styled.div`
  position: absolute;
  font-size: 36px;
  pointer-events: none;
  animation: ${floatAnimation} 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  z-index: 10;
  will-change: transform;
  user-select: none;
`;

const WidgetContainer = styled.div<{ 
  isProfitNegative?: boolean; 
  isZero?: boolean;
  profitPercentage: number;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  background: rgba(26, 27, 38, 0.95);
  border-radius: 12px;
  padding: 10px 25px;
  color: white;
  width: 340px;
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
        return 'linear-gradient(45deg, #7aa2f7 0%, #7dcfff 50%, #7aa2f7 100%)';
      }
      return props.isProfitNegative
        ? 'linear-gradient(45deg, #7aa2f7 0%, #f7768e 50%, #7aa2f7 100%)'
        : 'linear-gradient(45deg, #7aa2f7 0%, #9ece6a 50%, #7aa2f7 100%)';
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

      const color = props.isProfitNegative ? '247, 118, 142' : '158, 206, 106';
      
      return `
        linear-gradient(135deg, 
          rgba(${color}, ${intensity}) 0%,
          rgba(122, 162, 247, 0) 35%,
          rgba(122, 162, 247, 0) 65%,
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

const EmojiDivider = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(calc(-50% + 60px), -50%);
  font-size: 32px;
  animation: ${rotateAndBounce} 2s ease-in-out forwards;
  z-index: 10;
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 120px;
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;
  padding: 4px 0;

  &:first-child::after {
    content: '';
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 40px;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(122, 162, 247, 0.3),
      transparent
    );
    z-index: 20;
  }
`;

const Label = styled.div`
  color: #7aa2f7;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
`;

const Value = styled.div<{ isProfit?: boolean; isProfitNegative?: boolean; isZero?: boolean }>`
  font-family: 'Space Mono', monospace;
  font-size: 32px;
  font-weight: 700;
  color: ${props => {
    if (!props.isProfit) return '#7dcfff';
    if (props.isZero) return '#7aa2f7';
    return props.isProfitNegative ? '#f7768e' : '#9ece6a';
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

  &::after {
    content: '≡';
    font-size: 28px;
    opacity: 0.8;
  }
`;

const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=' + import.meta.env.VITE_HELIUS_API_KEY;

interface EmojiParticle {
  id: number;
  emoji: string;
  style: React.CSSProperties;
}

interface Props {
  walletAddress: string;
  initialBalance?: number;
}

export const SolanaWidget: React.FC<Props> = ({ 
  walletAddress = import.meta.env.VITE_WALLET_ADDRESS, 
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
  const [isBalanceChanged, setIsBalanceChanged] = useState(false);

  const happyEmojis = ['😊', '😄', '🤑', '🥳', '😎', '🤩', '😇', '🤪', '😋', '😸'];
  const sadEmojis = ['😢', '😭', '😩', '😫', '😰', '😣', '😖', '🥺', '😿', '😾'];

  const createEmojiParticles = (isPositiveChange: boolean) => {
    setIsBalanceChanged(true);
    setTimeout(() => setIsBalanceChanged(false), 2000);
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

  useEffect(() => {
    let isMounted = true;
    let publicKey: PublicKey;

    try {
      publicKey = new PublicKey(walletAddress);
    } catch (err) {
      console.error('Неверный адрес кошелька:', err);
      setError('Неверный адрес кошелька');
      setIsLoading(false);
      return;
    }

    const connection = new Connection(RPC_ENDPOINT, {
      commitment: 'confirmed' as Commitment,
      wsEndpoint: RPC_ENDPOINT.replace('https', 'wss'),
    });

    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        console.log('Получаем баланс для адреса:', walletAddress);
        
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / 1e9;
        
        if (isMounted) {
          console.log('Баланс получен успешно:', solBalance, 'SOL');
          
          if (solBalance !== lastBalance) {
            const isPositiveChange = solBalance > lastBalance;
            setBalance(solBalance);
            const newProfit = solBalance - initialPoint;
            console.log('Обновляем профит:', newProfit, '(баланс:', solBalance, '- точка отсчета:', initialPoint, ')');
            setProfit(newProfit);
            setLastBalance(solBalance);
            
            createEmojiParticles(isPositiveChange);
          }
          
          setError(null);
        }
      } catch (error) {
        console.error('Ошибка при получении баланса:', error);
        if (isMounted) {
          setError('Ошибка получения баланса');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    let subscriptionId: number | undefined;
    const subscribeToBalance = async () => {
      try {
        subscriptionId = connection.onAccountChange(
          publicKey,
          () => {
            fetchBalance();
          },
          'confirmed'
        );
      } catch (error) {
        console.error('Ошибка подписки на изменения:', error);
      }
    };

    fetchBalance();
    subscribeToBalance();

    return () => {
      isMounted = false;
      if (subscriptionId !== undefined) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [walletAddress, initialPoint]);

  const getEnergyColor = () => {
    if (profit === 0) return '#7aa2f7';
    return profit < 0 ? '#f7768e' : '#9ece6a';
  };

  // Вычисляем процент изменения относительно начальной точки
  const profitPercentage = initialPoint > 0 ? (profit / initialPoint) * 100 : 0;

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
          <Label>Депозит</Label>
          <Value>
            {isLoading ? '...' : error ? '???' : balance.toFixed(2)}
          </Value>
        </ValueContainer>
        <ValueContainer>
          <Label>Профит</Label>
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
              ? '0.00'
              : `${profit > 0 ? '+' : ''}${profit.toFixed(2)}`}
          </Value>
        </ValueContainer>
      </WidgetContainer>
    </>
  );
};