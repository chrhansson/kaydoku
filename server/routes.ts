import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { generatePuzzle } from "../client/src/lib/puzzle-generator";
import { z } from "zod";

const createGameSchema = z.object({
  size: z.number().min(3).max(7),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export async function registerRoutes(app: Express) {
  app.post("/api/games", async (req, res) => {
    try {
      const result = createGameSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ message: "Invalid request" });
        return;
      }

      const { size, difficulty } = result.data;
      const gameState = generatePuzzle(size, difficulty);
      const game = await storage.createGame(gameState);
      res.json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid game ID" });
        return;
      }

      const game = await storage.getGame(id);
      if (!game) {
        res.status(404).json({ message: "Game not found" });
        return;
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}