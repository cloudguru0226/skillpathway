import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RoadmapTypeSwitchProps {
  onChange: (type: string) => void;
  initialType?: string;
}

export function RoadmapTypeSwitch({ onChange, initialType = "role" }: RoadmapTypeSwitchProps) {
  const [activeType, setActiveType] = useState(initialType);

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    onChange(type);
  };

  return (
    <div className="flex mb-4">
      <div className="bg-card rounded-lg p-1 inline-flex">
        <Button
          variant="ghost"
          className={`px-5 py-2 rounded-md text-sm font-medium ${
            activeType === "role" 
              ? "bg-primary text-primary-foreground" 
              : "text-foreground hover:bg-muted"
          }`}
          onClick={() => handleTypeChange("role")}
        >
          Role Based
        </Button>
        <Button
          variant="ghost"
          className={`px-5 py-2 rounded-md text-sm font-medium ${
            activeType === "skill" 
              ? "bg-primary text-primary-foreground" 
              : "text-foreground hover:bg-muted"
          }`}
          onClick={() => handleTypeChange("skill")}
        >
          Skill Based
        </Button>
      </div>
    </div>
  );
}
