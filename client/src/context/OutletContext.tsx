import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet } from '../types';
import { api } from '../services/api';

interface OutletContextType {
  outlets: Outlet[];
  selectedOutlet: Outlet | null;
  setSelectedOutlet: (outlet: Outlet) => void;
  loading: boolean;
}

const OutletContext = createContext<OutletContextType | undefined>(undefined);

export const OutletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutletState] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOutlets()
      .then((data) => {
        setOutlets(data.outlets);
        const savedSlug = localStorage.getItem('tsg_selected_outlet');
        const found = data.outlets.find((o) => o.slug === savedSlug);
        if (found) {
          setSelectedOutletState(found);
        } else if (data.outlets.length > 0) {
          setSelectedOutletState(data.outlets[0]); // Default to Colombo
        }
      })
      .catch((err) => console.error('Failed to load outlets', err))
      .finally(() => setLoading(false));
  }, []);

  const setSelectedOutlet = (outlet: Outlet) => {
    setSelectedOutletState(outlet);
    localStorage.setItem('tsg_selected_outlet', outlet.slug);
  };

  return (
    <OutletContext.Provider
      value={{
        outlets,
        selectedOutlet,
        setSelectedOutlet,
        loading,
      }}
    >
      {children}
    </OutletContext.Provider>
  );
};

export const useOutlet = () => {
  const context = useContext(OutletContext);
  if (!context) throw new Error('useOutlet must be used within OutletProvider');
  return context;
};
