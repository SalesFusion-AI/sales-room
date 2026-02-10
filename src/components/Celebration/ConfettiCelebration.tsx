import { useEffect, useState, useRef } from 'react';
import { useQualificationScore } from '../../store/chatStore';

interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
}

const ConfettiCelebration = () => {
  const qualificationScore = useQualificationScore();
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [hasShown, setHasShown] = useState(false);
  const animationRef = useRef<number | null>(null);
  
  const colors = [
    '#007AFF', '#0A84FF', '#5AC8FA', '#30D158', 
    '#FF9F0A', '#FF453A', '#BF5AF2', '#AC8E68'
  ];

  const createConfetti = (): Confetti[] => {
    const pieces: Confetti[] = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      });
    }
    return pieces;
  };

  const updateConfetti = (pieces: Confetti[]): Confetti[] => {
    return pieces
      .map(piece => ({
        ...piece,
        x: piece.x + piece.vx,
        y: piece.y + piece.vy,
        vy: piece.vy + 0.1, // gravity
        rotation: piece.rotation + piece.rotationSpeed,
      }))
      .filter(piece => piece.y < window.innerHeight + 50); // Remove off-screen pieces
  };

  useEffect(() => {
    if (qualificationScore >= 75 && !hasShown) {
      setHasShown(true);
      setConfetti(createConfetti());
      
      const animate = () => {
        setConfetti(prevConfetti => {
          const updated = updateConfetti(prevConfetti);
          if (updated.length > 0) {
            animationRef.current = requestAnimationFrame(animate);
          }
          return updated;
        });
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      // Clear after 6 seconds
      setTimeout(() => {
        setConfetti([]);
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      }, 6000);
    }
    
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [qualificationScore, hasShown]);

  if (confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiCelebration;