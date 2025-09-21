import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { TFTChampion, TFTItem, COST_TO_RARITY } from '@/types/tft';
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
}

export default function ChampionCard({ 
  champion, 
  items = [],
  isOnBoard = false, 
  onClick, 
  onRemove,
  onItemEquip,
  onItemRemove
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

            {/* Items section for board champions */}
            {isOnBoard && (
              <div className="h-1/3 p-1 bg-muted/50 border-t border-border">
                <div className="flex gap-1 h-full">
                  {Array.from({ length: maxItems }, (_, index) => {
                    const item = items[index];
                    return (
                      <div key={index} className="flex-1 relative">
                        {item ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative h-full">
                                <ItemCard 
                                  item={item} 
                                  size="small" 
                                  isEquipped
                                />
                                <button
                                  onClick={(e) => handleItemRemove(index, e)}
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <ItemTooltip item={item} />
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="w-full h-full border border-dashed border-muted-foreground/30 rounded flex items-center justify-center bg-muted/20">
                            <Plus className="w-3 h-3 text-muted-foreground/50" />
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
          <ChampionTooltip champion={champion} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}