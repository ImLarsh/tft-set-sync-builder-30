import React from 'react';
import { TFTChampion, TFTItem, TFTTrait, TFTAugment } from '@/types/tft';
import { Star, Zap, Shield, Sword } from 'lucide-react';

interface ChampionTooltipProps {
  champion: TFTChampion;
  items?: TFTItem[];
}

export function ChampionTooltip({ champion, items = [] }: ChampionTooltipProps) {
  return (
    <div className="max-w-sm p-4 bg-card border border-border rounded-lg shadow-xl">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={champion.image}
          alt={champion.name}
          className="w-12 h-12 rounded-lg border border-border"
        />
        <div>
          <h3 className="font-bold text-foreground">{champion.name}</h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: champion.cost }, (_, i) => (
              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Traits</p>
          <div className="flex flex-wrap gap-1">
            {champion.traits.map((trait) => (
              <span key={trait} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                {trait}
              </span>
            ))}
          </div>
        </div>
        
        {items.length > 0 && (
          <div>
            <p className="text-sm font-medium text-primary mb-1">Equipped Items ({items.length}/3)</p>
            <div className="flex flex-wrap gap-1">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded">
                  <img src={item.image} alt={item.name} className="w-3 h-3" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <p className="text-sm font-medium text-primary mb-1">Ability: {champion.ability.name}</p>
          <p className="text-xs text-muted-foreground">{champion.ability.description}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Sword className="w-3 h-3 text-destructive" />
            <span>{champion.stats.damage}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-secondary" />
            <span>{champion.stats.health}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-accent" />
            <span>{champion.ability.manaCost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ItemTooltipProps {
  item: TFTItem;
}

export function ItemTooltip({ item }: ItemTooltipProps) {
  return (
    <div className="max-w-xs p-3 bg-card border border-border rounded-lg shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={item.image}
          alt={item.name}
          className="w-8 h-8 rounded border border-border"
        />
        <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{item.description}</p>
      {item.stats && Object.keys(item.stats).length > 0 && (
        <div className="mt-2 text-xs">
          <p className="font-medium text-primary mb-1">Stats:</p>
          {Object.entries(item.stats).map(([stat, value]) => (
            <div key={stat} className="flex justify-between">
              <span className="capitalize">{stat}:</span>
              <span className="text-accent">+{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface TraitTooltipProps {
  trait: TFTTrait;
  currentCount?: number;
}

export function TraitTooltip({ trait, currentCount = 0 }: TraitTooltipProps) {
  return (
    <div className="max-w-sm p-3 bg-card border border-border rounded-lg shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={trait.image}
          alt={trait.name}
          className="w-8 h-8 rounded border border-border"
        />
        <h3 className="font-bold text-foreground text-sm">{trait.name}</h3>
        {currentCount > 0 && (
          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
            {currentCount}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-2">{trait.description}</p>
      <div className="space-y-1">
        <p className="text-xs font-medium text-primary">Breakpoints:</p>
        {trait.effects.map((effect, index) => (
          <div key={index} className={`text-xs flex justify-between ${
            currentCount >= effect.minUnits ? 'text-primary font-medium' : 'text-muted-foreground'
          }`}>
            <span>{effect.minUnits} units</span>
            <span className={`px-1 rounded ${
              effect.style === 1 ? 'bg-trait-bronze' :
              effect.style === 2 ? 'bg-trait-silver' :
              effect.style === 3 ? 'bg-trait-gold' :
              'bg-trait-prismatic'
            } text-xs`}>
              {effect.style === 1 ? 'Bronze' :
               effect.style === 2 ? 'Silver' :
               effect.style === 3 ? 'Gold' : 'Prismatic'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AugmentTooltipProps {
  augment: TFTAugment;
}

export function AugmentTooltip({ augment }: AugmentTooltipProps) {
  return (
    <div className="max-w-xs p-3 bg-card border border-border rounded-lg shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={augment.image}
          alt={augment.name}
          className="w-8 h-8 rounded border border-border"
        />
        <div>
          <h3 className="font-bold text-foreground text-sm">{augment.name}</h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: augment.tier }, (_, i) => (
              <Star key={i} className="w-2 h-2 fill-accent text-accent" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{augment.description}</p>
      {augment.associatedTraits.length > 0 && (
        <div>
          <p className="text-xs font-medium text-primary mb-1">Associated Traits:</p>
          <div className="flex flex-wrap gap-1">
            {augment.associatedTraits.map((trait) => (
              <span key={trait} className="px-1 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}