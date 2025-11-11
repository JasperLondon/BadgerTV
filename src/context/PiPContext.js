import { createContext, useCallback, useContext, useState } from 'react';

// PiPContext holds the current PiP stream and visibility
const PiPContext = createContext();

export function PiPProvider({ children }) {
  const [pipStream, setPipStream] = useState(null); // The stream object to show in PiP
  const [visible, setVisible] = useState(false); // Whether PiP is visible

  // Show PiP with a stream
  const showPiP = useCallback((stream) => {
    setPipStream(stream);
    setVisible(true);
  }, []);

  // Hide PiP
  const hidePiP = useCallback(() => {
    setVisible(false);
    setPipStream(null);
  }, []);

  // Return to full player
  const returnToPlayer = useCallback(() => {
    setVisible(false);
    // Navigation logic will be handled in PiPPlayer
  }, []);

  return (
    <PiPContext.Provider value={{ pipStream, visible, showPiP, hidePiP, returnToPlayer }}>
      {children}
    </PiPContext.Provider>
  );
}

export function usePiP() {
  return useContext(PiPContext);
}
