import { useEffect, useRef, useState } from "react";

export function useCustomScrollbar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const thumb = thumbRef.current;
    if (!container || !thumb) return;

    const updateThumb = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const ratio = scrollTop / (scrollHeight - clientHeight);
      const maxTop = clientHeight - thumb.offsetHeight;
      thumb.style.top = `${Math.max(0, ratio * maxTop)}px`;
    };

    updateThumb();
    container.addEventListener("scroll", updateThumb);

    return () => container.removeEventListener("scroll", updateThumb);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const thumb = thumbRef.current;
    if (!container || !thumb) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const rect = container.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const ratio = offsetY / rect.height;
      container.scrollTop =
        ratio * (container.scrollHeight - container.clientHeight);
    };

    const onMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  return { containerRef, thumbRef, setIsDragging };
}
