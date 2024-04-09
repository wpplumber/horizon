import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SpecialCard } from 'pages/account/cards';

interface CardContextType {
  cards: SpecialCard[];
  setCards: React.Dispatch<React.SetStateAction<SpecialCard[]>>;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider: React.FC<{ cards: SpecialCard[] }> = ({
  cards,
  children,
}) => {
  const [internalCards, setInternalCards] = useState<SpecialCard[]>(cards);

  // You can also update the cards state if the prop changes
  useEffect(() => {
    setInternalCards(cards);
  }, [cards]);

  return (
    <CardContext.Provider
      value={{ cards: internalCards, setCards: setInternalCards }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCardContext must be used within a CardProvider');
  }
  return context;
};
