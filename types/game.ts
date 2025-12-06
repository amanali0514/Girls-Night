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
  prompt?: string;
  promptSubmitted?: boolean;
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
  activePlayerId?: string | null;
  promptSubmissionPhase?: boolean;
  gameFinished?: boolean;
  revealed?: boolean;
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
  activePlayerId: string | null;
  promptSubmissionPhase: boolean;
  gameFinished: boolean;
  revealed: boolean;
  myPlayerId: string;
  createRoom(category: Category): Promise<string>;
  joinRoom(code: string, playerName: string): Promise<void>;
  startGame(): Promise<void>;
  nextPrompt(): Promise<void>;
  previousPrompt(): Promise<void>;
  leaveRoom(): Promise<void>;
  resetGroup(): void;
  submitPrompt(prompt: string): Promise<void>;
  setNextPlayer(nextPlayerId: string): Promise<void>;
  changeCategory(newCategory: Category): Promise<void>;
  playAgain(): Promise<void>;
  finishGame(): Promise<void>;
  updatePlayerName(newName: string): Promise<void>;
  revealCard(): Promise<void>;
}
