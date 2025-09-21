import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TFTItem } from '@/types/tft';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ItemTooltip } from '@/components/ui/tooltip-content';

interface ItemCardProps {
  item: TFTItem;
  size?: 'small' | 'medium' | 'large';
  isEquipped?: boolean;
  onClick?: () => void;
}

export default function ItemCard({ 
  item, 
  size = 'medium', 
  isEquipped = false,
  onClick 
}: ItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item-${item.id}-${Date.now()}`,
    data: { item, type: 'item' },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            className={cn(
              'relative group cursor-pointer transition-all duration-200',
              'bg-card border-2 border-border rounded-lg overflow-hidden',
              'hover:border-primary hover:scale-105 hover:shadow-lg',
              sizeClasses[size],
              isDragging && 'opacity-50 scale-110 rotate-2',
              isEquipped && 'border-primary bg-primary/10'
            )}
            onClick={onClick}
            {...listeners}
            {...attributes}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-item/TFT_Item_EmptyBag.png';
              }}
            />

            {/* Glow effect for equipped items */}
            {isEquipped && (
              <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <ItemTooltip item={item} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}