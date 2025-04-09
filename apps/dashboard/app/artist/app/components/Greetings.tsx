import { Sun, CloudSun, Moon } from "lucide-react";

function getGreetingWithIcon(date: Date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return {
      message: "Good morning",
      icon: <Sun className="w-6 h-6 text-yellow-500" />,
    };
  } else if (hour < 18) {
    return {
      message: "Good afternoon",
      icon: <CloudSun className="w-6 h-6 text-orange-400" />,
    };
  } else {
    return {
      message: "Good evening",
      icon: <Moon className="w-6 h-6 text-blue-500" />,
    };
  }
}

// Example usage in a React component
export default function Greeting({ name }: { name: string }) {
  const { message, icon } = getGreetingWithIcon();

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 tracking-tighter">
        <span>{message}</span>
        <span>{name}</span>

        {icon}
      </div>
    </div>
  );
}
