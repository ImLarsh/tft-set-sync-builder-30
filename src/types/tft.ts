export interface TFTChampion {
  id: string;
  name: string;
  cost: number;
  traits: string[];
  stats: {
    damage: number;
    health: number;
    armor: number;
    magicResist: number;
    attackSpeed: number;
    range: number;
  };
  ability: {
    name: string;
    description: string;
    manaCost: number;
    damage?: number[];
  };
  image: string;
  tier: number;
}

export interface TFTTrait {
  id: string;
  name: string;
  description: string;
  effects: {
    minUnits: number;
    maxUnits?: number;
    style: number; // 1=bronze, 2=silver, 3=gold, 4=prismatic
  }[];
  image: string;
}

export interface TFTItem {
  id: string;
  name: string;
  description: string;
  stats?: {
    [key: string]: number;
  };
  image: string;
  recipe?: string[];
}

export interface TFTAugment {
  id: string;
  name: string;
  description: string;
  tier: number;
  associatedTraits: string[];
  image: string;
}

export interface BoardPosition {
  x: number;
  y: number;
}

export interface PlacedChampion {
  champion: TFTChampion;
  position: BoardPosition;
  items: TFTItem[];
  id: string;
}

export interface TeamComposition {
  id: string;
  name: string;
  champions: PlacedChampion[];
  description?: string;
  createdAt: Date;
}

export interface TraitActivation {
  trait: TFTTrait;
  currentCount: number;
  activeLevel: number;
  style: number;
}

export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const COST_TO_RARITY: Record<number, RarityLevel> = {
  1: 'common',
  2: 'uncommon', 
  3: 'rare',
  4: 'epic',
  5: 'legendary',
};