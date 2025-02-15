import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface NumberPadProps {
  size: number;
  isScribbleMode: boolean;
  onNumberClick: (value: number) => void;
  onToggleMode: () => void;
  selectedCell: boolean;
}

export function NumberPad({ 
  size, 
  isScribbleMode, 
  onNumberClick, 
  onToggleMode,
  selectedCell 
}: NumberPadProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          {isScribbleMode ? "Scribble Mode" : "Number Mode"}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleMode}
          className={`h-8 w-8 p-0 ${isScribbleMode ? "bg-primary/10" : ""}`}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Toggle Scribble Mode</span>
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: size }, (_, i) => i + 1).map((number) => (
          <Button
            key={number}
            variant="outline"
            className="h-12 text-lg font-semibold"
            onClick={() => onNumberClick(number)}
            disabled={!selectedCell}
          >
            {number}
          </Button>
        ))}
      </div>
    </div>
  );
}