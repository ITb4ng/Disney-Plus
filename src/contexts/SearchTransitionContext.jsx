import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const SearchTransitionContext = createContext({
  transitionToken: 0,
  transitionSource: null,
  triggerSearchTransition: () => {},
});

export const SearchTransitionProvider = ({ children }) => {
  const [transition, setTransition] = useState({
    token: 0,
    source: null,
  });

  const triggerSearchTransition = useCallback((source) => {
    setTransition((prev) => ({
      token: prev.token + 1,
      source: source || "unknown",
    }));
  }, []);

  const value = useMemo(
    () => ({
      transitionToken: transition.token,
      transitionSource: transition.source,
      triggerSearchTransition,
    }),
    [transition.token, transition.source, triggerSearchTransition]
  );

  return (
    <SearchTransitionContext.Provider value={value}>
      {children}
    </SearchTransitionContext.Provider>
  );
};

export const useSearchTransition = () => useContext(SearchTransitionContext);
