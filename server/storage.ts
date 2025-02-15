import { kenkenGames, type Game, type GameState } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createGame(game: GameState): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createGame(gameState: GameState): Promise<Game> {
    const [game] = await db
      .insert(kenkenGames)
      .values({
        grid: gameState.grid,
        solution: gameState.solution,
        cages: gameState.cages,
        size: gameState.size,
        moves: gameState.moves,
      })
      .returning();
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db
      .select()
      .from(kenkenGames)
      .where(eq(kenkenGames.id, id));
    return game;
  }
}

export const storage = new DatabaseStorage();