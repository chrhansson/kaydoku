import { useEffect, useRef } from "react";
import type { Cage } from "@shared/schema";
import type { GridCell } from "@/lib/game-state";

interface KenKenGridProps {
  grid: GridCell[][];
  cages: Cage[];
  size: number;
  selectedCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
}

const OPERATORS = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  "=": "",
} as const;

export function KenKenGrid({
  grid,
  cages,
  size,
  selectedCell,
  onCellClick,
}: KenKenGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid || !Array.isArray(grid)) return;

    // Make canvas square and responsive to viewport
    const viewportSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.5);
    const cellSize = Math.floor(viewportSize / size);
    const canvasSize = cellSize * size;

    const scale = window.devicePixelRatio || 1;
    canvas.width = canvasSize * scale;
    canvas.height = canvasSize * scale;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cell backgrounds
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (selectedCell && selectedCell[0] === i && selectedCell[1] === j) {
          ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size * cellSize);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size * cellSize, i * cellSize);
      ctx.stroke();
    }

    // Draw cages
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    cages.forEach(cage => {
      // Draw cage boundaries
      for (let i = 0; i < cage.cells.length; i++) {
        const [row, col] = cage.cells[i];

        // Check each direction
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        directions.forEach(([dr, dc]) => {
          const newRow = row + dr;
          const newCol = col + dc;
          const isEdge = !cage.cells.some(
            ([r, c]) => r === newRow && c === newCol
          );

          if (isEdge) {
            ctx.beginPath();
            if (dr === 0) { // Vertical line
              const x = (col + (dc > 0 ? 1 : 0)) * cellSize;
              ctx.moveTo(x, row * cellSize);
              ctx.lineTo(x, (row + 1) * cellSize);
            } else { // Horizontal line
              const y = (row + (dr > 0 ? 1 : 0)) * cellSize;
              ctx.moveTo(col * cellSize, y);
              ctx.lineTo((col + 1) * cellSize, y);
            }
            ctx.stroke();
          }
        });
      }

      // Draw cage operation and target
      const [row, col] = cage.cells[0];
      const fontSize = Math.max(12, Math.floor(cellSize * 0.25));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = "#666";
      const text = `${cage.target}${OPERATORS[cage.operation]}`;
      ctx.fillText(
        text,
        col * cellSize + 4,
        row * cellSize + fontSize + 2
      );
    });

    // Draw numbers and scribbles
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cell = grid[i]?.[j];
        if (!cell) continue;

        if (cell.value > 0) {
          // Draw main number
          const fontSize = Math.floor(cellSize * 0.5);
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = "#000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            cell.value.toString(),
            (j + 0.5) * cellSize,
            (i + 0.5) * cellSize
          );
        } else if (cell.scribbles.size > 0) {
          // Draw scribbles in lower half of cell
          const scribbleSize = Math.floor(cellSize * 0.2);
          ctx.font = `${scribbleSize}px sans-serif`;
          ctx.fillStyle = "#666";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";

          const padding = Math.floor(cellSize * 0.1);
          const values = Array.from(cell.scribbles).sort((a, b) => a - b);

          // Start from middle of cell height
          const startY = i * cellSize + (cellSize * 0.5);

          values.forEach((value, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            ctx.fillText(
              value.toString(),
              j * cellSize + padding + (col * (cellSize / 3)),
              startY + padding + (row * (scribbleSize * 1.5))
            );
          });
        }
      }
    }
  }, [grid, cages, size, selectedCell]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cellSize = canvas.width / (size * (window.devicePixelRatio || 1));
    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);

    if (row >= 0 && row < size && col >= 0 && col < size) {
      onCellClick(row, col);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full aspect-square border border-border rounded-lg shadow-md touch-manipulation"
      onClick={handleClick}
    />
  );
}