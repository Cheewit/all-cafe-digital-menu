import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useInView } from '../hooks/useInView';

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  title?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  className = '',
  title = 'Animation',
}) => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  const shouldPlay = autoplay && !reducedMotion && inView;

  return (
    <div ref={ref} className={className} aria-label={title} role="img">
      {inView && (
        <Lottie
          animationData={animationData}
          loop={loop}
          autoplay={shouldPlay}
          style={{ width: '100%', height: '100%' }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
            progressiveLoad: true,
          }}
        />
      )}
    </div>
  );
};

export default LottieAnimation;
