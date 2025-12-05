export enum Category {
  Confessions = 'confessions',
  Dare = 'dare',
  Toxic = 'toxic',
  Chill = 'chill',
  BuildYourOwn = 'build-your-own',
}

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  category: Category | null;
  currentPromptIndex: number;
  prompts: string[];
  started: boolean;
  createdAt: number;
}

export interface GameContextType {
  selectedCategory: Category | null;
  prompts: string[];
  customPrompts: string[];
  playerCount: number;
  players: string[];
  currentPrompt: string | null;
  usedIndices: Set<number>;
  totalPrompts: number;
  promptsUsedCount: number;
  selectCategory(category: Category): void;
  setPlayers(names: string[]): void;
  setCustomPrompts(prompts: string[], count: number): void;
  getNextPrompt(): boolean;
  resetGame(): void;
}

export interface GroupContextType {
  roomId: string | null;
  players: Player[];
  hostId: string | null;
  isHost: boolean;
  category: Category | null;
  currentPromptIndex: number;
  prompts: string[];
  started: boolean;
  createRoom(category: Category): Promise<string>;
  joinRoom(code: string, playerName: string): Promise<void>;
  startGame(): Promise<void>;
  nextPrompt(): Promise<void>;
  leaveRoom(): Promise<void>;
  resetGroup(): void;
}
