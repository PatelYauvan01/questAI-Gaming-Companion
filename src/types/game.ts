export type ImportedGame = {
  id: string;
  title: string;
  executablePath: string;
  executableFilename: string;
  importDate: number;
  favorite: boolean;
  artworkPath?: string | null;
  description?: string | null;
  genre?: string | null;
  lastPlayed?: number | null;
};

export type GameUpdate = {
  title?: string;
  favorite?: boolean;
  description?: string | null;
  genre?: string | null;
};
