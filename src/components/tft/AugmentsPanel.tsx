import React from 'react';
import { TFTAugment, PlacedChampion } from '@/types/tft';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AugmentTooltip } from '@/components/ui/tooltip-content';
import { Sparkles } from 'lucide-react';

interface AugmentsPanelProps {
  augments: TFTAugment[];
  placedChampions: PlacedChampion[];
}

export default function AugmentsPanel({ augments, placedChampions }: AugmentsPanelProps) {
  // Get all traits from placed champions
  const championTraits = placedChampions.flatMap(pc => pc.champion.traits);
  
  // Filter augments that are relevant to current team composition
  const relevantAugments = augments.filter(augment =>
    augment.associatedTraits.some(trait => championTraits.includes(trait))
  );

  const allAugments = augments.slice(0, 20); // Show first 20 augments

  return (
    <TooltipProvider>
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-primary">Augments</h2>
        </div>
        
        {relevantAugments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-accent mb-2">Relevant to Your Team</h3>
            <div className="grid grid-cols-4 gap-2">
              {relevantAugments.map((augment) => (
                <Tooltip key={augment.id}>
                  <TooltipTrigger asChild>
                    <div className="relative group cursor-pointer">
                      <div className="w-12 h-12 bg-muted rounded-lg border-2 border-primary/50 flex items-center justify-center hover:border-primary transition-colors">
                        <img
                          src={augment.image}
                          alt={augment.name}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="absolute top-0 right-0 -mt-1 -mr-1">
                        {Array.from({ length: augment.tier }, (_, i) => (
                          <div key={i} className="w-2 h-2 bg-accent rounded-full inline-block ml-0.5" />
                        ))}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <AugmentTooltip augment={augment} />
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">All Augments</h3>
          <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto">
            {allAugments.map((augment) => (
              <Tooltip key={augment.id}>
                <TooltipTrigger asChild>
                  <div className="relative group cursor-pointer">
                    <div className="w-8 h-8 bg-muted rounded border border-border flex items-center justify-center hover:border-accent transition-colors">
                      <img
                        src={augment.image}
                        alt={augment.name}
                        className="w-6 h-6 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <AugmentTooltip augment={augment} />
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}