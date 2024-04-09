import type { SpecialAddress } from 'pages/account/addresses';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AddressContextType {
  addresses: SpecialAddress[];
  setAddresses: React.Dispatch<React.SetStateAction<SpecialAddress[]>>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ addresses: SpecialAddress[] }> = ({
  addresses,
  children,
}) => {
  const [internalAddresses, setInternalAddresses] =
    useState<SpecialAddress[]>(addresses);

  // You can also update the addresses state if the prop changes
  useEffect(() => {
    setInternalAddresses(addresses);
  }, [addresses]);

  return (
    <AddressContext.Provider
      value={{
        addresses: internalAddresses,
        setAddresses: setInternalAddresses,
      }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddressContext = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddressContext must be used within an AddressProvider');
  }
  return context;
};
