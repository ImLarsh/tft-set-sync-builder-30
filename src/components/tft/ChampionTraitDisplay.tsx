import React from 'react';
import { TFTChampion, TFTTrait, PlacedChampion } from '@/types/tft';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TraitTooltip } from '@/components/ui/tooltip-content';
import { cn } from '@/lib/utils';

interface ChampionTraitDisplayProps {
  champion: TFTChampion;
  allTraits: TFTTrait[];
  allPlacedChampions: PlacedChampion[];
  size?: 'small' | 'medium';
}

export default function ChampionTraitDisplay({ 
  champion, 
  allTraits, 
  allPlacedChampions,
  size = 'small'
}: ChampionTraitDisplayProps) {
  // Get matching traits for this champion
  const championTraits = allTraits.filter(trait => 
    champion.traits.some(championTrait => 
      championTrait.toLowerCase().includes(trait.name.toLowerCase()) ||
      trait.name.toLowerCase().includes(championTrait.toLowerCase()) ||
      championTrait === trait.name ||
      championTrait === trait.id
    )
  );

  // Calculate current counts for each trait
  const traitsWithCounts = championTraits.map(trait => {
    const currentCount = allPlacedChampions.filter(pc => 
      pc.champion.traits.some(championTrait => 
        championTrait.toLowerCase().includes(trait.name.toLowerCase()) ||
        trait.name.toLowerCase().includes(championTrait.toLowerCase()) ||
        championTrait === trait.name ||
        championTrait === trait.id
      )
    ).length;

    // Find active level
    let activeLevel = 0;
    let style = 0;
    for (let i = trait.effects.length - 1; i >= 0; i--) {
      const effect = trait.effects[i];
      if (currentCount >= effect.minUnits) {
        activeLevel = i + 1;
        style = effect.style;
        break;
      }
    }

    return { trait, currentCount, activeLevel, style };
  });

  const getTraitStyleClass = (style: number, isActive: boolean) => {
    if (!isActive) return 'bg-muted/50 text-muted-foreground border-muted';
    
    switch (style) {
      case 1: return 'bg-trait-bronze text-black border-trait-bronze shadow-sm';
      case 2: return 'bg-trait-silver text-black border-trait-silver shadow-md';
      case 3: return 'bg-trait-gold text-black border-trait-gold shadow-lg';
      case 4: return 'bg-trait-prismatic text-white border-trait-prismatic shadow-xl';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const sizeClasses = {
    small: 'w-3 h-3 text-[8px]',
    medium: 'w-4 h-4 text-xs'
  };

  if (traitsWithCounts.length === 0) return null;

  return (
    <TooltipProvider>
      <div className={cn(
        "flex gap-0.5 flex-wrap",
        size === 'small' && "max-w-[60px]",
        size === 'medium' && "max-w-[80px]"
      )}>
        {traitsWithCounts.slice(0, 3).map(({ trait, currentCount, activeLevel, style }) => {
          const isActive = activeLevel > 0;
          
          return (
            <Tooltip key={trait.id}>
              <TooltipTrigger asChild>
                <div className={cn(
                  'rounded-full border flex items-center justify-center font-bold cursor-pointer transition-all duration-200 hover:scale-110',
                  sizeClasses[size],
                  getTraitStyleClass(style, isActive),
                  isActive && 'animate-pulse'
                )}>
                  {currentCount}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <TraitTooltip trait={trait} currentCount={currentCount} />
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}