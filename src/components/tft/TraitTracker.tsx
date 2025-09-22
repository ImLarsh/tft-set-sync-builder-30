import React from 'react';
import { TFTTrait, PlacedChampion, TraitActivation } from '@/types/tft';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TraitTooltip } from '@/components/ui/tooltip-content';
import { cn } from '@/lib/utils';

interface TraitTrackerProps {
  traits: TFTTrait[];
  placedChampions: PlacedChampion[];
}

export default function TraitTracker({ traits, placedChampions }: TraitTrackerProps) {
  // Calculate trait activations
  const traitActivations: TraitActivation[] = traits.map(trait => {
    const currentCount = placedChampions.filter(pc => 
      pc.champion.traits.some(championTrait => {
        // Exact match first
        if (championTrait === trait.name) return true;
        // Clean match without Set15_ prefix
        if (championTrait === trait.id.replace(/^TFT15_/, '').replace(/^Set15_/, '')) return true;
        // Fallback to case-insensitive exact match
        if (championTrait.toLowerCase() === trait.name.toLowerCase()) return true;
        return false;
      })
    ).length;

    let activeLevel = 0;
    let style = 0;

    // Find the highest active level
    for (let i = trait.effects.length - 1; i >= 0; i--) {
      const effect = trait.effects[i];
      if (currentCount >= effect.minUnits) {
        activeLevel = i + 1;
        style = effect.style;
        break;
      }
    }

    return {
      trait,
      currentCount,
      activeLevel,
      style,
    };
  }).filter(ta => ta.currentCount > 0); // Only show traits with champions

  const getTraitStyleClass = (style: number) => {
    switch (style) {
      case 1: return 'bg-trait-bronze text-black';
      case 2: return 'bg-trait-silver text-black';
      case 3: return 'bg-trait-gold text-black';
      case 4: return 'bg-trait-prismatic text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTraitStyleName = (style: number) => {
    switch (style) {
      case 1: return 'Bronze';
      case 2: return 'Silver';
      case 3: return 'Gold';
      case 4: return 'Prismatic';
      default: return 'Inactive';
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-4 shadow-lg backdrop-blur-sm">
        <h3 className="text-lg font-bold text-primary mb-4">Active Synergies</h3>
        
        {traitActivations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No traits active. Place champions on the board to see trait synergies!
          </p>
        ) : (
          <div className="space-y-3">
            {traitActivations.map(ta => (
              <div key={ta.trait.id} className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer">
                      <img
                        src={ta.trait.image}
                        alt={ta.trait.name}
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/14.23.1/img/tft-trait/Set12_Default.png';
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-foreground">{ta.trait.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {ta.currentCount} units
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <TraitTooltip trait={ta.trait} currentCount={ta.currentCount} />
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center gap-2">
                  {/* Trait levels */}
                  <div className="flex gap-1">
                    {ta.trait.effects.map((effect, index) => {
                      const isActive = ta.activeLevel > index;
                      return (
                        <Badge
                          key={index}
                          variant="outline"
                          className={cn(
                            'text-xs px-2 py-1',
                            isActive && getTraitStyleClass(effect.style),
                            !isActive && 'opacity-50'
                          )}
                        >
                          {effect.minUnits}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Current activation status */}
                  {ta.activeLevel > 0 && (
                    <Badge className={cn('text-xs', getTraitStyleClass(ta.style))}>
                      {getTraitStyleName(ta.style)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Team stats summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="font-medium text-foreground mb-2">Team Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Champions:</span>
              <span className="text-foreground">{placedChampions.length}/28</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="text-foreground">
                {placedChampions.reduce((sum, pc) => sum + pc.champion.cost, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Traits:</span>
              <span className="text-foreground">{traitActivations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gold+ Traits:</span>
              <span className="text-foreground">
                {traitActivations.filter(ta => ta.style >= 3).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}