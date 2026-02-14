import { useCustomScrollbar } from "@omenai/shared-hooks/hooks/useCustomScrollbar";
export function ScrollArea({ children }: { children: React.ReactNode }) {
  const { containerRef, thumbRef, setIsDragging } = useCustomScrollbar();

  return (
    <div className="relative scroll-wrapper h-full">
      <div
        ref={containerRef}
        className="scroll-container max-h-[650px] overflow-y-auto pr-6"
      >
        {children}
      </div>

      <div
        ref={thumbRef}
        className="scroll-thumb"
        onMouseDown={() => setIsDragging(true)}
      />
    </div>
  );
}
