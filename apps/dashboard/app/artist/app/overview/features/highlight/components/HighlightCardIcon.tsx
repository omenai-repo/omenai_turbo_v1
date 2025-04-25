export default function HighlightCardIcon({
  icon,
  color,
}: {
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`p-3 rounded-[40%] ${color} text-white grid place-items-center`}
    >
      {icon}
    </div>
  );
}
