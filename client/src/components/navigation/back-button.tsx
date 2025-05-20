import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}