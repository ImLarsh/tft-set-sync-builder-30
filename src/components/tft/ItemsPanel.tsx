import React, { useState } from 'react';
import { TFTItem } from '@/types/tft';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Package } from 'lucide-react';
import ItemCard from './ItemCard';

interface ItemsPanelProps {
  items: TFTItem[];
  onItemSelect?: (item: TFTItem) => void;
}

export default function ItemsPanel({ items, onItemSelect }: ItemsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter out tutorial and empty items, focus on real items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isRealItem = item.name && !item.id.includes('Tutorial') && !item.id.includes('Empty');
    return matchesSearch && isRealItem;
  }).slice(0, 50); // Limit to first 50 items for performance

  // Categorize items
  const basicItems = filteredItems.filter(item => 
    ['TFT_Item_BFSword', 'TFT_Item_RecurveBow', 'TFT_Item_NeedlesslyLargeRod', 
     'TFT_Item_ChainVest', 'TFT_Item_NegatronCloak', 'TFT_Item_GiantsBelt',
     'TFT_Item_TearOfTheGoddess', 'TFT_Item_SparringGloves', 'TFT_Item_Spatula'].includes(item.id)
  );
  
  const combinedItems = filteredItems.filter(item => !basicItems.includes(item));

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-primary">Items Arsenal</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {/* Basic Components */}
          {basicItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Basic Components</h3>
              <div className="grid grid-cols-6 gap-2">
                {basicItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    size="medium"
                    onClick={() => onItemSelect?.(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Combined Items */}
          {combinedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Combined Items ({combinedItems.length})
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {combinedItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    size="medium"
                    onClick={() => onItemSelect?.(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
        <p>Drag items onto champions to equip them</p>
        <p>Showing {filteredItems.length} items</p>
      </div>
    </div>
  );
}