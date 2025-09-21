import React, { useState, useMemo } from 'react';
import { TFTChampion } from '@/types/tft';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChampionCard from './ChampionCard';

interface ChampionLibraryProps {
  champions: TFTChampion[];
  onChampionSelect: (champion: TFTChampion) => void;
}

export default function ChampionLibrary({ champions, onChampionSelect }: ChampionLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCost, setSelectedCost] = useState<number | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);

  // Get unique traits and costs for filters
  const allTraits = useMemo(() => {
    const traits = new Set<string>();
    champions.forEach(champion => 
      champion.traits.forEach(trait => traits.add(trait))
    );
    return Array.from(traits).sort();
  }, [champions]);

  const costs = [1, 2, 3, 4, 5];

  // Filter champions based on search and filters
  const filteredChampions = useMemo(() => {
    return champions.filter(champion => {
      const matchesSearch = champion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           champion.traits.some(trait => trait.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCost = selectedCost === null || champion.cost === selectedCost;
      
      const matchesTrait = selectedTrait === null || champion.traits.includes(selectedTrait);
      
      return matchesSearch && matchesCost && matchesTrait;
    });
  }, [champions, searchTerm, selectedCost, selectedTrait]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCost(null);
    setSelectedTrait(null);
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-4 shadow-lg backdrop-blur-sm h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-primary mb-3">Champion Arsenal</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search champions or traits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Cost Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Cost
            </label>
            <div className="flex gap-1">
              {costs.map(cost => (
                <Button
                  key={cost}
                  variant={selectedCost === cost ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCost(selectedCost === cost ? null : cost)}
                  className="flex items-center gap-1"
                >
                  <Star className="w-3 h-3" />
                  {cost}
                </Button>
              ))}
            </div>
          </div>

          {/* Trait Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Traits
            </label>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {allTraits.map(trait => (
                <Badge
                  key={trait}
                  variant={selectedTrait === trait ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer text-xs",
                    selectedTrait === trait && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setSelectedTrait(selectedTrait === trait ? null : trait)}
                >
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCost || selectedTrait) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Champions Grid */}
      <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
        {filteredChampions.map(champion => (
          <ChampionCard
            key={champion.id}
            champion={champion}
            onClick={() => onChampionSelect(champion)}
          />
        ))}
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        Showing {filteredChampions.length} of {champions.length} champions
      </div>
    </div>
  );
}