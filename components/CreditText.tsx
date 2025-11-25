// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const CreditText: React.FC = () => {
  const { getTranslation } = useAppContext();
  return (
    <div className="text-[10px] text-center py-6 px-2 leading-relaxed text-[var(--bdl-text-secondary)] opacity-70">
      {getTranslation('creditTextLine1')}
    </div>
  );
};

export default CreditText;