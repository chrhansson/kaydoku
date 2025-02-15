import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const kenkenGames = pgTable("kenken_games", {
  id: serial("id").primaryKey(),
  grid: jsonb("grid").notNull(),
  solution: jsonb("solution").notNull(),
  cages: jsonb("cages").notNull(),
  size: integer("size").notNull(),
  moves: jsonb("moves").notNull(),
});

export const insertGameSchema = createInsertSchema(kenkenGames);

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof kenkenGames.$inferSelect;

export type Cage = {
  cells: number[][];
  target: number;
  operation: "+" | "-" | "*" | "/" | "=";
};

export type GameState = {
  grid: number[][];
  solution: number[][];
  cages: Cage[];
  size: number;
  moves: number[][];
};
