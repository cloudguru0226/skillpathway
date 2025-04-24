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
    <div className="flex justify-center mb-8">
      <div className="bg-muted rounded-lg p-1 inline-flex">
        <Button
          variant={activeType === "role" ? "default" : "ghost"}
          className={`px-5 py-2 rounded-md text-sm font-medium ${
            activeType === "role" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card"
          }`}
          onClick={() => handleTypeChange("role")}
        >
          Role Based
        </Button>
        <Button
          variant={activeType === "skill" ? "default" : "ghost"}
          className={`px-5 py-2 rounded-md text-sm font-medium ${
            activeType === "skill" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card"
          }`}
          onClick={() => handleTypeChange("skill")}
        >
          Skill Based
        </Button>
      </div>
    </div>
  );
}
