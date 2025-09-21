import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { TFTChampion, TFTTrait, TFTItem, TFTAugment, PlacedChampion, BoardPosition } from '@/types/tft';
import { tftApi } from '@/services/tftApi';
import HexGrid from '@/components/tft/HexGrid';
import ChampionLibrary from '@/components/tft/ChampionLibrary';
import TraitTracker from '@/components/tft/TraitTracker';
import TeamCompositionManager from '@/components/tft/TeamCompositionManager';
import ItemsPanel from '@/components/tft/ItemsPanel';
import AugmentsPanel from '@/components/tft/AugmentsPanel';
import ShareTeamModal from '@/components/tft/ShareTeamModal';
import ChampionCard from '@/components/tft/ChampionCard';
import ItemCard from '@/components/tft/ItemCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, Gamepad2 } from 'lucide-react';

export default function Index() {
  const [champions, setChampions] = useState<TFTChampion[]>([]);
  const [traits, setTraits] = useState<TFTTrait[]>([]);
  const [items, setItems] = useState<TFTItem[]>([]);
  const [augments, setAugments] = useState<TFTAugment[]>([]);
  const [placedChampions, setPlacedChampions] = useState<PlacedChampion[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<{ champion?: TFTChampion; item?: TFTItem } | null>(null);
  const { toast } = useToast();

  // Load data from Riot API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [championsData, traitsData, itemsData, augmentsData] = await Promise.all([
          tftApi.getChampions(),
          tftApi.getTraits(),
          tftApi.getItems(),
          tftApi.getAugments(),
        ]);
        
        setChampions(championsData);
        setTraits(traitsData);
        setItems(itemsData);
        setAugments(augmentsData);
        
        toast({
          title: "TFT Set 15 Data Loaded!",
          description: `Loaded ${championsData.length} champions, ${traitsData.length} traits, and ${augmentsData.length} augments from Riot API.`,
        });
      } catch (error) {
        console.error('Failed to load TFT data:', error);
        toast({
          title: "Failed to Load Data",
          description: "Using fallback data. Check your internet connection.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const champion = active.data.current?.champion;
    const item = active.data.current?.item;
    const type = active.data.current?.type;
    
    if (type === 'champion' && champion) {
      setDraggedItem({ champion });
    } else if (type === 'item' && item) {
      setDraggedItem({ item });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    
    // Handle champion placement on hex grid
    if (activeData?.type === 'champion' && over.id.toString().startsWith('hex-') && overData?.isEmpty) {
      const champion = activeData.champion as TFTChampion;
      const position = overData.position as BoardPosition;
      const fromBoard = activeData.fromBoard;
      
      // Check if champion is already on board
      const existingChampion = placedChampions.find(pc => pc.champion.id === champion.id);
      if (existingChampion && !fromBoard) {
        toast({
          title: "Champion Already Placed",
          description: `${champion.name} is already on the board.`,
          variant: "destructive",
        });
        return;
      }

      // Add champion to board
      const newPlacedChampion: PlacedChampion = {
        id: `${champion.id}-${Date.now()}`,
        champion,
        position,
        items: [],
      };

      setPlacedChampions(prev => [...prev, newPlacedChampion]);
      
      toast({
        title: "Champion Placed!",
        description: `${champion.name} has been added to your board.`,
      });
    }
    
    // Handle item equipping on champions
    else if (activeData?.type === 'item' && overData?.acceptsItems) {
      const item = activeData.item as TFTItem;
      const targetChampion = overData.champion as TFTChampion;
      
      console.log('Item drop - Item:', item.name, 'Target Champion:', targetChampion.name);
      
      // Find the placed champion by matching the base champion id
      const placedChampion = placedChampions.find(pc => pc.champion.id === targetChampion.id);
      console.log('Found placed champion:', placedChampion);
      
      if (placedChampion) {
        handleItemEquip(placedChampion.id, item);
      }
    }
  };

  const handleRemoveChampion = (championId: string) => {
    setPlacedChampions(prev => prev.filter(pc => pc.id !== championId));
    toast({
      title: "Champion Removed",
      description: "Champion has been removed from the board.",
    });
  };

  const handleItemEquip = (championId: string, item: TFTItem) => {
    console.log('handleItemEquip called with:', championId, item.name);
    console.log('Current placed champions:', placedChampions.map(pc => ({ id: pc.id, name: pc.champion.name, items: pc.items.length })));
    
    setPlacedChampions(prev => prev.map(pc => {
      if (pc.id === championId && pc.items.length < 3) {
        console.log('Equipping item to:', pc.champion.name);
        return { ...pc, items: [...pc.items, item] };
      }
      return pc;
    }));
    
    toast({
      title: "Item Equipped!",
      description: `${item.name} has been equipped.`,
    });
  };

  const handleItemRemove = (championId: string, itemIndex: number) => {
    setPlacedChampions(prev => prev.map(pc => {
      if (pc.id === championId) {
        const newItems = [...pc.items];
        newItems.splice(itemIndex, 1);
        return { ...pc, items: newItems };
      }
      return pc;
    }));
    
    toast({
      title: "Item Removed",
      description: "Item has been unequipped from champion.",
    });
  };

  const handleChampionSelect = (champion: TFTChampion) => {
    // Find an empty hex to place the champion
    const occupiedPositions = placedChampions.map(pc => `${pc.position.x}-${pc.position.y}`);
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 7; col++) {
        const positionKey = `${col}-${row}`;
        if (!occupiedPositions.includes(positionKey)) {
          const newPlacedChampion: PlacedChampion = {
            id: `${champion.id}-${Date.now()}`,
            champion,
            position: { x: col, y: row },
            items: [],
          };
          setPlacedChampions(prev => [...prev, newPlacedChampion]);
          toast({
            title: "Champion Added!",
            description: `${champion.name} has been placed on the board.`,
          });
          return;
        }
      }
    }

    toast({
      title: "Board Full",
      description: "No empty spaces available on the board.",
      variant: "destructive",
    });
  };

  const handleChampionClick = (placedChampion: PlacedChampion) => {
    // Future: Open champion details/items modal
    toast({
      title: "Champion Details",
      description: `${placedChampion.champion.name} - ${placedChampion.champion.traits.join(', ')}`,
    });
  };

  const handleLoadTeam = (team: PlacedChampion[]) => {
    setPlacedChampions(team);
  };

  const handleClearTeam = () => {
    setPlacedChampions([]);
    toast({
      title: "Board Cleared",
      description: "All champions have been removed from the board.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="relative">
            <Gamepad2 className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <Loader2 className="w-6 h-6 animate-spin text-primary absolute top-5 right-5" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Loading TFT Arsenal</h2>
          <p className="text-muted-foreground">Fetching champions, traits, and items from Riot Games...</p>
          <div className="mt-4 w-64 mx-auto bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">TFT Set 15 Board Builder</h1>
            <p className="text-muted-foreground">Professional team composition tool for Teamfight Tactics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-semibold text-foreground">{champions.length}</p>
                <p className="text-xs text-muted-foreground">Champions</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{traits.length}</p>
                <p className="text-xs text-muted-foreground">Traits</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{items.length}</p>
                <p className="text-xs text-muted-foreground">Items</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{augments.length}</p>
                <p className="text-xs text-muted-foreground">Augments</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Powered by Riot Games API</p>
          </div>
          <ShareTeamModal currentTeam={placedChampions} />
        </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Champion Library */}
            <div className="col-span-12 lg:col-span-3">
              <ChampionLibrary 
                champions={champions} 
                onChampionSelect={handleChampionSelect}
              />
            </div>

            {/* Center - Board */}
            <div className="col-span-12 lg:col-span-6">
              <HexGrid
                champions={placedChampions}
                onRemoveChampion={handleRemoveChampion}
                onChampionClick={handleChampionClick}
                onItemEquip={handleItemEquip}
                onItemRemove={handleItemRemove}
              />
            </div>

            {/* Right Sidebar - Traits, Augments & Management */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <TraitTracker 
                traits={traits}
                placedChampions={placedChampions}
              />
              
              <AugmentsPanel
                augments={augments}
                placedChampions={placedChampions}
              />
              
              <TeamCompositionManager
                currentTeam={placedChampions}
                onLoadTeam={handleLoadTeam}
                onClearTeam={handleClearTeam}
              />
            </div>
          </div>

          {/* Bottom Panel - Items */}
          <div className="mt-8">
            <ItemsPanel items={items} />
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedItem?.champion && (
            <div className="transform rotate-2 scale-110 opacity-90">
              <ChampionCard champion={draggedItem.champion} />
            </div>
          )}
          {draggedItem?.item && (
            <div className="transform rotate-2 scale-110 opacity-90">
              <ItemCard item={draggedItem.item} />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}