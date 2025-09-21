import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { PlacedChampion, BoardPosition, TFTTrait } from '@/types/tft';
import ChampionCard from './ChampionCard';

interface HexGridProps {
  champions: PlacedChampion[];
  traits: TFTTrait[];
  onRemoveChampion: (id: string) => void;
  onChampionClick: (champion: PlacedChampion) => void;
  onItemEquip: (championId: string, item: any) => void;
  onItemRemove: (championId: string, itemIndex: number) => void;
}

const GRID_ROWS = 4;
const GRID_COLS = 7;

export default function HexGrid({ champions, traits, onRemoveChampion, onChampionClick, onItemEquip, onItemRemove }: HexGridProps) {
  const renderHex = (row: number, col: number) => {
    const position: BoardPosition = { x: col, y: row };
    const placedChampion = champions.find(
      c => c.position.x === col && c.position.y === row
    );
    
    const { isOver, setNodeRef } = useDroppable({
      id: `hex-${row}-${col}`,
      data: { position, isEmpty: !placedChampion },
    });

    const isEven = row % 2 === 0;
    const offsetX = isEven ? 0 : 50; // Hex offset for proper tessellation

    return (
      <div
        key={`${row}-${col}`}
        ref={setNodeRef}
        className={cn(
          'relative hex-shape transition-all duration-200',
          'border-2 border-hex-border',
          'hover:border-hex-hover hover:bg-hex-hover/20',
          isOver && 'drop-zone-active',
          placedChampion && 'bg-hex-occupied'
        )}
        style={{
          width: '80px',
          height: '80px',
          position: 'absolute',
          left: `${col * 75 + offsetX}px`,
          top: `${row * 65}px`,
        }}
      >
        {placedChampion && (
          <div className="absolute inset-1">
            <ChampionCard
              champion={placedChampion.champion}
              items={placedChampion.items}
              isOnBoard
              onClick={() => onChampionClick(placedChampion)}
              onRemove={() => onRemoveChampion(placedChampion.id)}
              onItemRemove={(itemIndex) => onItemRemove(placedChampion.id, itemIndex)}
              allTraits={traits}
              allPlacedChampions={champions}
            />
          </div>
        )}
        
        {!placedChampion && (
          <div className="absolute inset-2 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-hex-border/50" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-6 shadow-lg backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Team Builder Board</h2>
        <p className="text-sm text-muted-foreground">Drag champions and items to build your perfect team composition</p>
      </div>
      
      <div 
        className="relative mx-auto"
        style={{
          width: `${GRID_COLS * 75 + 50}px`,
          height: `${GRID_ROWS * 65}px`,
        }}
      >
        {Array.from({ length: GRID_ROWS }, (_, row) =>
          Array.from({ length: GRID_COLS }, (_, col) => renderHex(row, col))
        )}
      </div>
      
      <div className="mt-8 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
            {champions.length}/28 units
          </span>
          <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full font-medium">
            {champions.reduce((sum, c) => sum + c.champion.cost, 0)} gold cost
          </span>
          <span className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full font-medium">
            {champions.reduce((sum, c) => sum + c.items.length, 0)} items equipped
          </span>
        </div>
        <p className="text-muted-foreground">Right-click champions to manage items</p>
      </div>
    </div>
  );
}