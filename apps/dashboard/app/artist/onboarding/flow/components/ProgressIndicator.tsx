// app/onboarding/components/ProgressIndicator.tsx

type Props = {
  step: number;
  total: number;
};

export default function ProgressIndicator({ step, total }: Props) {
  const progress = ((step + 1) / total) * 100;

  return (
    <div className="w-full mb-6">
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-dark transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-fluid-xs text-slate-600 mt-2">
        Step {step + 1} of {total}
      </div>
    </div>
  );
}
