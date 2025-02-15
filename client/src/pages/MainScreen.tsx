import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Difficulty = "easy" | "medium" | "hard";
type GameSize = 3 | 5 | 7;

export default function MainScreen() {
  const [_, navigate] = useLocation();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [size, setSize] = useState<GameSize>(5);

  const startNewGame = async () => {
    try {
      const res = await apiRequest("POST", "/api/games", { size, difficulty });
      const game = await res.json();
      navigate(`/game/${game.id}`);
    } catch (error) {
      console.error("Failed to create new game:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            KenKen Puzzle
          </h1>
          <p className="text-muted-foreground">
            Challenge yourself with a mathematical puzzle that combines logic and arithmetic
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Difficulty
            </label>
            <ToggleGroup
              type="single"
              value={difficulty}
              onValueChange={(value) => value && setDifficulty(value as Difficulty)}
              className="justify-center"
            >
              <ToggleGroupItem value="easy" className="flex-1">Easy</ToggleGroupItem>
              <ToggleGroupItem value="medium" className="flex-1">Medium</ToggleGroupItem>
              <ToggleGroupItem value="hard" className="flex-1">Hard</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Grid Size
            </label>
            <ToggleGroup
              type="single"
              value={size.toString()}
              onValueChange={(value) => value && setSize(parseInt(value) as GameSize)}
              className="justify-center"
            >
              <ToggleGroupItem value="3" className="flex-1">3×3</ToggleGroupItem>
              <ToggleGroupItem value="5" className="flex-1">5×5</ToggleGroupItem>
              <ToggleGroupItem value="7" className="flex-1">7×7</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full px-8 py-6 text-lg rounded-full shadow-lg"
          onClick={startNewGame}
        >
          New Game
        </Button>
      </Card>
    </div>
  );
}