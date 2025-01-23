export default function HighlightCardIcon({
  icon,
  color,
}: {
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`p-4 rounded-[40%] ${color} text-white grid place-items-center`}
    >
      {icon}
    </div>
  );
}
