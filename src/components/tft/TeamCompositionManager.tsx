import React, { useState } from 'react';
import { TeamComposition, PlacedChampion } from '@/types/tft';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Share2, Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamCompositionManagerProps {
  currentTeam: PlacedChampion[];
  onLoadTeam: (team: PlacedChampion[]) => void;
  onClearTeam: () => void;
}

export default function TeamCompositionManager({ 
  currentTeam, 
  onLoadTeam, 
  onClearTeam 
}: TeamCompositionManagerProps) {
  const [teamName, setTeamName] = useState('');
  const [savedTeams, setSavedTeams] = useState<TeamComposition[]>([]);
  const { toast } = useToast();

  // Load saved teams from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('tft-saved-teams');
    if (saved) {
      try {
        setSavedTeams(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved teams:', error);
      }
    }
  }, []);

  const saveTeam = () => {
    if (!teamName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your team composition.",
        variant: "destructive",
      });
      return;
    }

    if (currentTeam.length === 0) {
      toast({
        title: "Empty Team",
        description: "Add some champions to your board before saving.",
        variant: "destructive",
      });
      return;
    }

    const newTeam: TeamComposition = {
      id: Date.now().toString(),
      name: teamName,
      champions: currentTeam,
      createdAt: new Date(),
    };

    const updatedTeams = [...savedTeams, newTeam];
    setSavedTeams(updatedTeams);
    localStorage.setItem('tft-saved-teams', JSON.stringify(updatedTeams));
    
    setTeamName('');
    toast({
      title: "Team Saved!",
      description: `"${newTeam.name}" has been saved to your library.`,
    });
  };

  const loadTeam = (team: TeamComposition) => {
    onLoadTeam(team.champions);
    toast({
      title: "Team Loaded!",
      description: `"${team.name}" has been loaded to your board.`,
    });
  };

  const deleteTeam = (teamId: string) => {
    const updatedTeams = savedTeams.filter(team => team.id !== teamId);
    setSavedTeams(updatedTeams);
    localStorage.setItem('tft-saved-teams', JSON.stringify(updatedTeams));
    toast({
      title: "Team Deleted",
      description: "Team composition has been removed from your library.",
    });
  };

  const exportTeam = (team: TeamComposition) => {
    const exportData = JSON.stringify(team, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${team.name.replace(/\s+/g, '_')}_tft_comp.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Team Exported!",
      description: "Team composition has been downloaded as a JSON file.",
    });
  };

  const generateShareCode = (team: TeamComposition) => {
    const shareData = btoa(JSON.stringify({
      name: team.name,
      champions: team.champions.map(pc => ({
        championId: pc.champion.id,
        position: pc.position,
        items: pc.items.map(item => item.id),
      }))
    }));
    
    const shareUrl = `${window.location.origin}?team=${shareData}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Share Link Copied!",
      description: "Share this link with others to show your team composition.",
    });
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-4 shadow-lg backdrop-blur-sm">
      <h3 className="text-lg font-bold text-primary mb-4">Team Manager</h3>
      
      {/* Save Current Team */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground mb-2">Save Current Team</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Enter team name..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={saveTeam} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Current Team Actions */}
      <div className="mb-6 flex gap-2">
        <Button variant="outline" size="sm" onClick={onClearTeam}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Board
        </Button>
      </div>

      {/* Saved Teams */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Saved Teams ({savedTeams.length})</h4>
        
        {savedTeams.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No saved teams yet. Create and save a team composition to get started!
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedTeams.map(team => (
              <Card key={team.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-foreground">{team.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {team.champions.length} champions
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {team.champions.reduce((sum, pc) => sum + pc.champion.cost, 0)} cost
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadTeam(team)}
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generateShareCode(team)}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportTeam(team)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteTeam(team.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}