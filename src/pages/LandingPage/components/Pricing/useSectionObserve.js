import { useEffect, useState } from "react";

export function useSectionObserve(ref, options = {}) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 화면 위로 사라지면 sticky
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 1,
        ...options,
      }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return isSticky;
}
