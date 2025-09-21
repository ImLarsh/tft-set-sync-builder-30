import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { TFTChampion, TFTItem, TFTTrait, PlacedChampion, COST_TO_RARITY } from '@/types/tft';
import { Star, X, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChampionTooltip, ItemTooltip } from '@/components/ui/tooltip-content';
import ItemCard from './ItemCard';

interface ChampionCardProps {
  champion: TFTChampion;
  items?: TFTItem[];
  isOnBoard?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onItemEquip?: (item: TFTItem) => void;
  onItemRemove?: (itemIndex: number) => void;
  allTraits?: TFTTrait[];
  allPlacedChampions?: PlacedChampion[];
}

export default function ChampionCard({ 
  champion, 
  items = [],
  isOnBoard = false, 
  onClick, 
  onRemove,
  onItemEquip,
  onItemRemove,
  allTraits = [],
  allPlacedChampions = []
}: ChampionCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `champion-${champion.id}-${isOnBoard ? 'board' : 'library'}`,
    data: { champion, fromBoard: isOnBoard, type: 'champion' },
    disabled: isOnBoard, // Can't drag from board directly
  });

  // Make champion droppable for items when on board
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `champion-${champion.id}-items`,
    data: { champion, acceptsItems: true },
    disabled: !isOnBoard, // Only board champions can receive items
  });

  const rarity = COST_TO_RARITY[champion.cost];
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const maxItems = 3; // Maximum items per champion

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  const handleItemRemove = (itemIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onItemRemove?.(itemIndex);
  };

  // Combine refs for both dragging and dropping
  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node);
    setDropRef(node);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={combinedRef}
            style={style}
            className={cn(
              'relative group cursor-pointer transition-all duration-200',
              'bg-card border-2 rounded-lg overflow-hidden',
              `border-rarity-${rarity} rarity-${rarity}`,
              isDragging && 'dragging',
              isOnBoard ? 'w-full h-full min-h-[80px]' : 'w-16 h-20 hover:scale-105',
              !isOnBoard && 'hover:animate-bounce-subtle',
              isOver && 'ring-2 ring-primary ring-offset-2'
            )}
            onClick={handleClick}
            {...(isOnBoard ? {} : { ...listeners, ...attributes })}
          >
            {/* Champion Image */}
            <div className={cn(
              "relative w-full",
              isOnBoard ? "h-2/3" : "h-full"
            )}>
              <img
                src={champion.image}
                alt={champion.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/14.23.1/img/tft-champion/TFT_Champion_Default.png';
                }}
              />
              
              {/* Cost indicator */}
              <div className="absolute top-1 left-1 flex items-center">
                {Array.from({ length: champion.cost }, (_, i) => (
                  <Star key={i} className="w-2 h-2 fill-primary text-primary" />
                ))}
              </div>

              {/* Remove button for board champions */}
              {isOnBoard && onRemove && (
                <button
                  onClick={handleRemove}
                  className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Champion name overlay */}
              {!isOnBoard && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                  <p className="text-xs font-medium text-white truncate">
                    {champion.name}
                  </p>
                </div>
              )}
            </div>

            {/* Champion info and traits for board champions */}
            {isOnBoard && (
              <div className="h-1/3 p-1 bg-muted/50 border-t border-border space-y-1">
                {/* Champion name and traits */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate flex-1">{champion.name}</span>
                  <div className="flex gap-0.5 ml-1">
                    {isOnBoard && allTraits.length > 0 && allPlacedChampions.length > 0 ? (
                      // Show trait counts for board champions
                      allTraits
                        .filter(trait => 
                          champion.traits.some(championTrait => 
                            championTrait.toLowerCase().includes(trait.name.toLowerCase()) ||
                            trait.name.toLowerCase().includes(championTrait.toLowerCase()) ||
                            championTrait === trait.name ||
                            championTrait === trait.id
                          )
                        )
                        .slice(0, 3)
                        .map((trait) => {
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

                          const isActive = activeLevel > 0;
                          const getTraitStyleClass = (style: number, isActive: boolean) => {
                            if (!isActive) return 'bg-muted/80 text-muted-foreground';
                            
                            switch (style) {
                              case 1: return 'bg-trait-bronze text-black';
                              case 2: return 'bg-trait-silver text-black';
                              case 3: return 'bg-trait-gold text-black';
                              case 4: return 'bg-trait-prismatic text-white';
                              default: return 'bg-muted text-muted-foreground';
                            }
                          };

                          return (
                            <Tooltip key={trait.id}>
                              <TooltipTrigger asChild>
                                <div className={cn(
                                  'w-3 h-3 rounded-full text-[8px] flex items-center justify-center font-bold cursor-pointer transition-all hover:scale-110',
                                  getTraitStyleClass(style, isActive),
                                  isActive && 'shadow-sm'
                                )}>
                                  {currentCount}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs">
                                  <div className="font-medium">{trait.name}</div>
                                  <div className="text-muted-foreground">
                                    {currentCount}/{trait.effects[0]?.minUnits || 1} units
                                  </div>
                                  {isActive && (
                                    <div className="text-primary">Active!</div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })
                    ) : (
                      // Fallback to simple trait initials
                      champion.traits.slice(0, 3).map((trait, idx) => (
                        <Tooltip key={trait}>
                          <TooltipTrigger asChild>
                            <div className="w-3 h-3 bg-primary/80 rounded-full text-[8px] text-primary-foreground flex items-center justify-center font-bold cursor-pointer hover:bg-primary transition-colors">
                              {trait.charAt(0).toUpperCase()}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="text-xs font-medium">{trait}</div>
                          </TooltipContent>
                        </Tooltip>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Items section */}
                <div className="flex gap-1">
                  {Array.from({ length: maxItems }, (_, index) => {
                    const item = items[index];
                    return (
                      <div key={index} className="flex-1 relative">
                        {item ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative h-4 w-full">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded border border-primary/50"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-item/TFT_Item_EmptyBag.png';
                                  }}
                                />
                                <button
                                  onClick={(e) => handleItemRemove(index, e)}
                                  className="absolute -top-1 -right-1 w-2 h-2 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-1 h-1" />
                                </button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <ItemTooltip item={item} />
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="w-full h-4 border border-dashed border-muted-foreground/30 rounded flex items-center justify-center bg-muted/20">
                            <Plus className="w-2 h-2 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={isOnBoard ? "top" : "right"}>
          <ChampionTooltip champion={champion} items={items} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}