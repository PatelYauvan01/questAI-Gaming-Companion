export type GameStatus = "Installed" | "Ready" | "Paused" | "Cloud Only";

export type Game = {
  id: string;
  title: string;
  description: string;
  genre: string;
  artwork: string;
  imageUrl?: string;
  favorite: boolean;
  lastPlayed: string;
  status: GameStatus;
  playtime: string;
  tone: string;
};

export const mockGames: Game[] = [
  {
    id: "elden-ring",
    title: "Elden Ring",
    description:
      "Explore a shattered open world of dangerous bosses, hidden lore, and cryptic questlines.",
    genre: "Action RPG",
    artwork: "from-cyan-400/35 via-slate-800 to-zinc-950",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxwtqySWJGPSlaah9Mt9ENp9fsFfMfzptXmLeZ5dPOUA&s",
    favorite: false,
    lastPlayed: "Yesterday",
    status: "Installed",
    playtime: "126h",
    tone: "Mystic open world",
  },
  {
    id: "sekiro",
    title: "Sekiro",
    description:
      "Master precise swordplay through a brutal revenge story set in a mythic Sengoku era.",
    genre: "Action Adventure",
    artwork: "from-red-500/30 via-stone-800 to-zinc-950",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/6/6e/Sekiro_art.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
    favorite: false,
    lastPlayed: "3 days ago",
    status: "Ready",
    playtime: "48h",
    tone: "Precision combat",
  },
  {
    id: "hollow-knight",
    title: "Hollow Knight",
    description:
      "Descend into Hallownest for atmospheric exploration, secrets, and demanding boss fights.",
    genre: "Metroidvania",
    artwork: "from-indigo-400/35 via-slate-900 to-black",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQesEFirWFNEuUagkC0oSM4sgEnp0FJh80Lwe6wfcjEJA&s",
    favorite: false,
    lastPlayed: "Today",
    status: "Installed",
    playtime: "72h",
    tone: "Melancholy exploration",
  },
  {
    id: "hollow-knight",
    title: "Hollow Knight Silksong",
    description:
      "Descend into Hallownest for atmospheric exploration, secrets, and demanding boss fights.",
    genre: "Metroidvania",
    artwork: "from-indigo-400/35 via-slate-900 to-black",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTkpTSakw6j31aILObV9UdbFdSCEVl2hefG5sdeaN7UQ&s=10",
    favorite: false,
    lastPlayed: "Today",
    status: "Installed", 
    playtime: "72h",
    tone: "Melancholy exploration",
  },
  {
    id: "witcher-3",
    title: "The Witcher 3",
    description:
      "Track monsters, Find Your adopted daughter, political plots, and personal choices across the Continent.",
    genre: "Story RPG",
    artwork: "from-emerald-500/30 via-zinc-800 to-black",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg",
    favorite: false,
    lastPlayed: "Last week",
    status: "Installed",
    playtime: "214h",
    tone: "Branching narrative",
  },
  {
    id: "god-of-war",
    title: "God of War",
    description:
      "Journey through Norse realms with cinematic combat, family drama, and mythic puzzles.",
    genre: "Action Adventure",
    artwork: "from-sky-300/35 via-slate-800 to-zinc-950",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg",
    favorite: false,
    lastPlayed: "2 weeks ago",
    status: "Paused",
    playtime: "35h",
    tone: "Cinematic myth",
  },
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    description:
      "Navigate Night City contracts, character builds, factions, and high-stakes choices.",
    genre: "RPG",
    artwork: "from-fuchsia-500/35 via-slate-900 to-black",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg",
    favorite: false,
    lastPlayed: "5 days ago",
    status: "Ready",
    playtime: "89h",
    tone: "Neon roleplay",
  },
  {
    id: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    description:
      "Command a party through reactive quests, tactical battles, and character-driven drama.",
    genre: "CRPG",
    artwork: "from-amber-400/30 via-stone-900 to-black",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQya0TnW5_8VuSzbpJ8nt5vTJmi8uykvyHzd-6odbx2uA&s=10",
    favorite: false,
    lastPlayed: "Today",
    status: "Installed",
    playtime: "156h",
    tone: "Tactical storytelling",
  },
];

export const getGameById = (id: string | undefined) =>
  mockGames.find((game) => game.id === id);
