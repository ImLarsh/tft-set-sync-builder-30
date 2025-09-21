import { TFTChampion, TFTTrait, TFTItem, TFTAugment } from '../types/tft';

// Riot Games Data Dragon API endpoints
const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com/cdn';
const VERSION_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
const REALMS_URL = 'https://ddragon.leagueoflegends.com/realms/na.json'; // Default to NA region

// Set 15 identifier for filtering
const SET_15_IDENTIFIER = 'TFT15_';
const SET_15_TRAIT_IDENTIFIERS = ['TFT15_', 'Set15_'];

class TFTApiService {
  private version: string = '';
  private region: string = 'na';

  async initialize() {
    try {
      // Get latest version
      const versionResponse = await fetch(VERSION_URL);
      const versions = await versionResponse.json();
      this.version = versions[0]; // Latest version

      // Optionally get realm data for more specific version info
      try {
        const realmResponse = await fetch(REALMS_URL);
        const realmData = await realmResponse.json();
        console.log('Realm data:', realmData);
      } catch (realmError) {
        console.warn('Could not fetch realm data, using latest version:', realmError);
      }
    } catch (error) {
      console.error('Failed to fetch version:', error);
      this.version = '15.18.1'; // Fallback version
    }
  }

  async getChampions(): Promise<TFTChampion[]> {
    try {
      if (!this.version) await this.initialize();
      
      const response = await fetch(
        `${DDRAGON_BASE}/${this.version}/data/en_US/tft-champion.json`
      );
      const data = await response.json();
      
      // Filter only Set 15 champions
      const set15Champions = Object.values(data.data).filter((champion: any) =>
        champion.id?.startsWith(SET_15_IDENTIFIER)
      );
      
      return set15Champions.map((champion: any) => ({
        id: champion.apiName || champion.id || champion.name?.toLowerCase().replace(/\s+/g, ''),
        name: champion.name,
        cost: champion.tier || champion.cost || 1, // Use tier as cost for Set 15
        traits: this.extractTraitNames(champion.traits) || [],
        stats: {
          damage: champion.stats?.damage || 50,
          health: champion.stats?.hp || 500,
          armor: champion.stats?.armor || 20,
          magicResist: champion.stats?.magicResist || 20,
          attackSpeed: champion.stats?.attackSpeed || 0.6,
          range: champion.stats?.range || 1,
        },
        ability: {
          name: champion.ability?.name || 'Unknown',
          description: champion.ability?.desc || 'No description available',
          manaCost: champion.ability?.startingMana || 50,
          damage: champion.ability?.variables?.find((v: any) => v.name === 'Damage')?.value || [100, 150, 200],
        },
        image: `${DDRAGON_BASE}/${this.version}/img/tft-champion/${champion.image?.full || 'TFT_Champion_Default.png'}`,
        tier: champion.tier || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch champions:', error);
      return this.getMockChampions();
    }
  }

  async getTraits(): Promise<TFTTrait[]> {
    try {
      if (!this.version) await this.initialize();
      
      const response = await fetch(
        `${DDRAGON_BASE}/${this.version}/data/en_US/tft-trait.json`
      );
      const data = await response.json();
      
      // Filter only Set 15 traits
      const set15Traits = Object.values(data.data).filter((trait: any) =>
        SET_15_TRAIT_IDENTIFIERS.some(identifier => trait.id?.startsWith(identifier))
      );
      
      return set15Traits.map((trait: any) => ({
        id: trait.id,
        name: trait.name,
        description: trait.description || `${trait.name} trait description`,
        effects: trait.effects || [
          { minUnits: 2, style: 1 },
          { minUnits: 4, style: 2 },
          { minUnits: 6, style: 3 },
        ],
        image: `${DDRAGON_BASE}/${this.version}/img/tft-trait/${trait.image?.full || 'TFT_Trait_Default.png'}`,
      }));
    } catch (error) {
      console.error('Failed to fetch traits:', error);
      return this.getMockTraits();
    }
  }

  async getItems(): Promise<TFTItem[]> {
    try {
      if (!this.version) await this.initialize();
      
      const response = await fetch(
        `${DDRAGON_BASE}/${this.version}/data/en_US/tft-item.json`
      );
      const data = await response.json();
      
      // Filter out empty/invalid items and focus on current items
      const validItems = Object.values(data.data).filter((item: any) =>
        item.name && item.name.trim() !== '' && !item.id?.includes('Tutorial')
      );
      
      return validItems.map((item: any) => ({
        id: item.id,
        name: item.name || 'Unknown Item',
        description: item.desc || item.description || 'No description available',
        stats: item.effects || {},
        image: `${DDRAGON_BASE}/${this.version}/img/tft-item/${item.image?.full || 'TFT_Item_Default.png'}`,
        recipe: item.composition || item.from || [],
      }));
    } catch (error) {
      console.error('Failed to fetch items:', error);
      return this.getMockItems();
    }
  }

  async getAugments(): Promise<TFTAugment[]> {
    try {
      if (!this.version) await this.initialize();
      
      const response = await fetch(
        `${DDRAGON_BASE}/${this.version}/data/en_US/tft-augments.json`
      );
      const data = await response.json();
      
      // Filter Set 15 augments
      const set15Augments = Object.values(data.data).filter((augment: any) =>
        augment.id?.includes('Set15') || augment.id?.includes('TFT15')
      );
      
      return set15Augments.map((augment: any) => ({
        id: augment.id,
        name: augment.name || 'Unknown Augment',
        description: augment.desc || augment.description || 'No description available',
        tier: augment.tier || 1,
        associatedTraits: augment.associatedTraits || [],
        image: `${DDRAGON_BASE}/${this.version}/img/tft-augment/${augment.image?.full || 'TFT_Augment_Default.png'}`,
      }));
    } catch (error) {
      console.error('Failed to fetch augments:', error);
      return this.getMockAugments();
    }
  }

  // Mock data for development/fallback
  private getMockChampions(): TFTChampion[] {
    return [
      {
        id: 'annie',
        name: 'Annie',
        cost: 1,
        traits: ['Invoker', 'Sugarcraft'],
        stats: {
          damage: 45,
          health: 500,
          armor: 20,
          magicResist: 20,
          attackSpeed: 0.6,
          range: 4,
        },
        ability: {
          name: 'Burst Fire',
          description: 'Annie hurls a fireball that deals magic damage.',
          manaCost: 40,
          damage: [180, 270, 405],
        },
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-champion/TFT12_Annie.TFT_Set12.png',
        tier: 1,
      },
      {
        id: 'blitzcrank',
        name: 'Blitzcrank',
        cost: 2,
        traits: ['Honeymancy', 'Vanguard'],
        stats: {
          damage: 55,
          health: 750,
          armor: 40,
          magicResist: 40,
          attackSpeed: 0.55,
          range: 1,
        },
        ability: {
          name: 'Power Fist',
          description: 'Blitzcrank charges up his fist to deal damage and knock up enemies.',
          manaCost: 50,
          damage: [200, 300, 450],
        },
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-champion/TFT12_Blitzcrank.TFT_Set12.png',
        tier: 1,
      },
      {
        id: 'jinx',
        name: 'Jinx',
        cost: 3,
        traits: ['Sugarcraft', 'Hunter'],
        stats: {
          damage: 65,
          health: 650,
          armor: 25,
          magicResist: 25,
          attackSpeed: 0.75,
          range: 4,
        },
        ability: {
          name: 'Super Mega Death Rocket!',
          description: 'Jinx fires a rocket that deals damage in a line.',
          manaCost: 60,
          damage: [250, 375, 565],
        },
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-champion/TFT12_Jinx.TFT_Set12.png',
        tier: 1,
      },
    ];
  }

  private getMockTraits(): TFTTrait[] {
    return [
      {
        id: 'Invoker',
        name: 'Invoker',
        description: 'Invokers gain Ability Power.',
        effects: [
          { minUnits: 2, style: 1 },
          { minUnits: 4, style: 2 },
          { minUnits: 6, style: 3 },
        ],
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-trait/Set12_Invoker.png',
      },
      {
        id: 'Sugarcraft',
        name: 'Sugarcraft',
        description: 'Sugarcraft units gain Health and deal bonus damage.',
        effects: [
          { minUnits: 2, style: 1 },
          { minUnits: 4, style: 2 },
          { minUnits: 6, style: 3 },
        ],
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-trait/Set12_Sugarcraft.png',
      },
      {
        id: 'Vanguard',
        name: 'Vanguard',
        description: 'Vanguards gain Armor and Magic Resist.',
        effects: [
          { minUnits: 2, style: 1 },
          { minUnits: 4, style: 2 },
          { minUnits: 6, style: 3 },
        ],
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-trait/Set12_Vanguard.png',
      },
    ];
  }

  private getMockItems(): TFTItem[] {
    return [
      {
        id: 'bf_sword',
        name: 'B.F. Sword',
        description: '+10 Attack Damage',
        stats: { damage: 10 },
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-item/TFT_Item_BFSword.png',
      },
      {
        id: 'needlessly_large_rod',
        name: 'Needlessly Large Rod',
        description: '+10 Ability Power',
        stats: { abilityPower: 10 },
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-item/TFT_Item_NeedlesslyLargeRod.png',
      },
      {
        id: 'chain_vest',
        name: 'Chain Vest',
        description: '+20 Armor',
        stats: { armor: 20 },
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-item/TFT_Item_ChainVest.png',
      },
    ];
  }

  // Helper method to extract trait names from trait objects or strings
  private extractTraitNames(traits: any[]): string[] {
    if (!traits) return [];
    
    return traits.map(trait => {
      if (typeof trait === 'string') {
        return trait;
      } else if (trait && trait.name) {
        return trait.name;
      } else if (trait && trait.id) {
        return trait.id.replace(/^TFT15_/, '').replace(/^Set15_/, '');
      }
      return trait;
    }).filter(Boolean);
  }

  private getMockAugments(): TFTAugment[] {
    return [
      {
        id: 'set15_star_guardian_heart',
        name: 'Star Guardian Heart',
        description: 'Your team counts as having 1 additional Star Guardian.',
        tier: 2,
        associatedTraits: ['Star Guardian'],
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-augment/TFT_Augment_StarGuardian.png',
      },
      {
        id: 'set15_sorcerer_crown',
        name: 'Sorcerer Crown',
        description: 'Your team counts as having 1 additional Sorcerer.',
        tier: 2,
        associatedTraits: ['Sorcerer'],
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/tft-augment/TFT_Augment_Sorcerer.png',
      },
    ];
  }
}

export const tftApi = new TFTApiService();