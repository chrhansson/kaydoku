import { useState, useCallback, useEffect } from "react";
import type { Game } from "@shared/schema";

export type ScribbleNotes = Set<number>;
export type GridCell = {
  value: number;
  scribbles: ScribbleNotes;
};

export function useGameState(game: Game | undefined) {
  const [grid, setGrid] = useState<GridCell[][]>(() => {
    const size = game?.size ?? 3;
    return Array(size).fill(0).map(() => 
      Array(size).fill(0).map(() => ({ 
        value: 0, 
        scribbles: new Set() 
      }))
    );
  });

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isScribbleMode, setIsScribbleMode] = useState(false);
  const [history, setHistory] = useState<Array<{
    row: number;
    col: number;
    prev: GridCell;
  }>>([]);

  // Update grid when game changes
  useEffect(() => {
    if (!game?.grid || !Array.isArray(game.grid) || !game.size) return;

    const newGrid: GridCell[][] = Array(game.size).fill(0).map((_, i) => 
      Array(game.size).fill(0).map((_, j) => ({
        value: game.grid[i]?.[j] ?? 0,
        scribbles: new Set<number>()
      }))
    );
    setGrid(newGrid);
    setSelectedCell(null);
    setHistory([]);
  }, [game?.grid, game?.size]);

  const makeMove = useCallback((value: number) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;

    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell, scribbles: new Set(cell.scribbles) })));
      setHistory(h => [...h, { row, col, prev: { ...newGrid[row][col] } }]);

      if (isScribbleMode) {
        if (newGrid[row][col].scribbles.has(value)) {
          newGrid[row][col].scribbles.delete(value);
        } else {
          newGrid[row][col].scribbles.add(value);
        }
      } else {
        newGrid[row][col].value = value;
        newGrid[row][col].scribbles.clear();
      }
      return newGrid;
    });
  }, [selectedCell, isScribbleMode]);

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell(prev => 
      prev && prev[0] === row && prev[1] === col ? null : [row, col]
    );
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;

    const lastMove = history[history.length - 1];
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell, scribbles: new Set(cell.scribbles) })));
      newGrid[lastMove.row][lastMove.col] = {
        value: lastMove.prev.value,
        scribbles: new Set(lastMove.prev.scribbles)
      };
      return newGrid;
    });
    setHistory(h => h.slice(0, -1));
  }, [history]);

  const toggleScribbleMode = useCallback(() => {
    setIsScribbleMode(prev => !prev);
  }, []);

  const validateSolution = useCallback(() => {
    if (!game?.solution) return 0;

    let errors = 0;
    const solution = game.solution as number[][];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j].value !== solution[i][j]) {
          errors++;
        }
      }
    }
    return errors;
  }, [grid, game?.solution]);

  return {
    grid,
    selectedCell,
    selectCell,
    isScribbleMode,
    toggleScribbleMode,
    undo,
    canUndo: history.length > 0,
    makeMove,
    validateSolution,
  };
}