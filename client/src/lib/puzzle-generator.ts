import type { GameState, Cage } from "@shared/schema";

function generateValidGrid(size: number): number[][] {
  const grid: number[][] = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0));

  // Fill with a valid solution (1-n in each row/column)
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid[i][j] = ((i + j) % size) + 1;
    }
  }

  return grid;
}

function isAdjacent(cell1: [number, number], cell2: [number, number]): boolean {
  return Math.abs(cell1[0] - cell2[0]) + Math.abs(cell1[1] - cell2[1]) === 1;
}

function generateCages(
  grid: number[][],
  maxCageSize: number,
  preferredOperations: Array<"+" | "-" | "*" | "/" | "=">,
): Cage[] {
  const size = grid.length;
  const cages: Cage[] = [];
  const used = new Set<string>();

  function cellKey(row: number, col: number): string {
    return `${row},${col}`;
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (used.has(cellKey(i, j))) continue;

      // Randomly decide cage size (1-maxCageSize cells)
      const cageSize = Math.min(maxCageSize, Math.floor(Math.random() * maxCageSize) + 1);
      const cells: [number, number][] = [[i, j]];
      used.add(cellKey(i, j));

      // Try to add adjacent cells to the cage
      for (let k = 0; k < cageSize - 1; k++) {
        const adjacentCells: [number, number][] = [];
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            if (Math.abs(di) + Math.abs(dj) !== 1) continue;
            const newI = i + di;
            const newJ = j + dj;
            if (
              newI >= 0 && newI < size &&
              newJ >= 0 && newJ < size &&
              !used.has(cellKey(newI, newJ))
            ) {
              adjacentCells.push([newI, newJ]);
            }
          }
        }
        if (adjacentCells.length === 0) break;
        const [nextI, nextJ] = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
        cells.push([nextI, nextJ]);
        used.add(cellKey(nextI, nextJ));
      }

      // Choose operation based on cage size and available operations
      let operation: "+" | "-" | "*" | "/" | "=";
      let target: number;

      if (cells.length === 1) {
        operation = "=";
        target = grid[cells[0][0]][cells[0][1]];
      } else if (cells.length === 2) {
        const a = grid[cells[0][0]][cells[0][1]];
        const b = grid[cells[1][0]][cells[1][1]];
        const max = Math.max(a, b);
        const min = Math.min(a, b);

        const validOperations = preferredOperations.filter(op => {
          if (op === "/" && max % min === 0) return true;
          if (op === "*" && a * b <= size * size) return true;
          if (op === "-") return true;
          if (op === "+") return true;
          return false;
        });

        operation = validOperations[Math.floor(Math.random() * validOperations.length)];
        switch (operation) {
          case "/":
            target = max / min;
            break;
          case "*":
            target = a * b;
            break;
          case "-":
            target = max - min;
            break;
          default:
            operation = "+";
            target = a + b;
        }
      } else {
        operation = "+";
        target = cells.reduce((sum, [r, c]) => sum + grid[r][c], 0);
      }

      cages.push({ cells, target, operation });
    }
  }

  return cages;
}

export function generatePuzzle(size: number, difficulty: "easy" | "medium" | "hard"): GameState {
  // Validate input
  if (size < 3 || size > 7) {
    throw new Error("Invalid grid size. Must be between 3 and 7.");
  }

  const solution = generateValidGrid(size);
  const grid = Array(size).fill(0).map(() => Array(size).fill(0));

  // Adjust cage sizes based on difficulty
  const maxCageSize = difficulty === "easy" ? 2 : 
                     difficulty === "medium" ? 3 : 4;

  // Adjust operations based on difficulty
  const preferredOperations: Array<"+" | "-" | "*" | "/" | "="> = 
    difficulty === "easy" ? ["+", "*", "="] :
    difficulty === "medium" ? ["+", "-", "*", "/", "="] :
    ["+", "-", "*", "/", "="];

  const cages = generateCages(solution, maxCageSize, preferredOperations);

  return {
    grid,
    solution,
    cages,
    size,
    moves: [],
  };
}