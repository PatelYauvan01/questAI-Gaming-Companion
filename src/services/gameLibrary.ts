import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { GameUpdate, ImportedGame } from "../types/game";

export async function listGames(): Promise<ImportedGame[]> {
  return invoke<ImportedGame[]>("list_games");
}

export async function importGameFromPath(path: string): Promise<ImportedGame> {
  return invoke<ImportedGame>("import_game", { path });
}

export async function importSteamGames(): Promise<ImportedGame[]> {
  return invoke<ImportedGame[]>("import_steam_games");
}

export async function removeGame(id: string): Promise<ImportedGame[]> {
  return invoke<ImportedGame[]>("remove_game", { id });
}

export async function updateGame(
  id: string,
  updates: GameUpdate,
): Promise<ImportedGame> {
  return invoke<ImportedGame>("update_game", { id, updates });
}

export async function selectExecutable(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    title: "Add a game executable",
    filters: [{ name: "Windows Executables", extensions: ["exe"] }],
  });

  if (selected === null || Array.isArray(selected)) {
    return null;
  }

  return selected;
}

export async function launchGame(path: string): Promise<number> {
  return invoke<number>("launch_game", { path });
}
