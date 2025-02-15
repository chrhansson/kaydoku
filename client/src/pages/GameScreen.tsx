import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { KenKenGrid } from "@/components/KenKenGrid";
import { NumberPad } from "@/components/NumberPad";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGameState } from "@/lib/game-state";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, Home, Loader2, Undo } from "lucide-react";
import type { Game } from "@shared/schema";

export default function GameScreen() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const gameId = parseInt(id ?? "");

  const { data: game, isLoading, error } = useQuery<Game>({
    queryKey: [`/api/games/${gameId}`],
    enabled: !isNaN(gameId),
  });

  const {
    grid,
    selectedCell,
    selectCell,
    isScribbleMode,
    toggleScribbleMode,
    undo,
    canUndo,
    makeMove,
    validateSolution,
  } = useGameState(game);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Error Loading Game</h2>
          <p className="text-muted-foreground mb-4">Failed to load the game. Please try again.</p>
          <Button onClick={() => navigate("/")}>Return to Menu</Button>
        </Card>
      </div>
    );
  }

  if (isLoading || !game) {
    return (
      <div className="min-h-screen p-4 bg-background animate-pulse">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-10 w-20 bg-muted rounded-md" />
            <div className="space-x-2 flex">
              <div className="h-10 w-10 bg-muted rounded-md" />
              <div className="h-10 w-10 bg-muted rounded-md" />
            </div>
          </div>
          <Card className="p-4 aspect-square" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-md" />
            ))}
          </div>
          <div className="h-12 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    const errors = validateSolution();
    if (errors === 0) {
      toast({
        title: "Congratulations!",
        description: "You've solved the puzzle correctly!",
      });
    } else {
      toast({
        title: "Not quite right",
        description: `You have ${errors} incorrect numbers.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="h-10 px-3">
            <Home className="h-4 w-4" />
            <span className="sr-only">Return to Menu</span>
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={undo}
              disabled={!canUndo}
              className="h-10 w-10 p-0"
            >
              <Undo className="h-4 w-4" />
              <span className="sr-only">Undo</span>
            </Button>
          </div>
        </div>

        <Card className="p-2">
          <KenKenGrid
            grid={grid}
            cages={game.cages}
            size={game.size}
            selectedCell={selectedCell}
            onCellClick={selectCell}
          />
        </Card>

        <div className="mt-4">
          <NumberPad
            size={game.size}
            isScribbleMode={isScribbleMode}
            onNumberClick={makeMove}
            onToggleMode={toggleScribbleMode}
            selectedCell={!!selectedCell}
          />
        </div>

        <Button
          className="w-full mt-4"
          size="lg"
          onClick={handleSubmit}
        >
          <Check className="mr-2 h-4 w-4" />
          Check Solution
        </Button>
      </div>
    </div>
  );
}