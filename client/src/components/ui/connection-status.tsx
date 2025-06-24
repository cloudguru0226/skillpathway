import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className = "" }: ConnectionStatusProps) {
  if (!isConnected) {
    return (
      <Badge variant="destructive" className={`text-xs ${className}`}>
        <WifiOff className="w-3 h-3 mr-1" />
        Offline
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={`text-xs ${className}`}>
      <Wifi className="w-3 h-3 mr-1" />
      Live
    </Badge>
  );
}