import React, { useState } from 'react';
import { PlacedChampion } from '@/types/tft';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Download } from 'lucide-react';

interface ShareTeamModalProps {
  currentTeam: PlacedChampion[];
}

export default function ShareTeamModal({ currentTeam }: ShareTeamModalProps) {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const generateTeamCode = () => {
    const teamData = {
      name: teamName || 'Untitled Team',
      description: teamDescription,
      champions: currentTeam.map(pc => ({
        id: pc.champion.id,
        position: pc.position,
        items: pc.items.map(item => item.id),
      })),
      createdAt: new Date().toISOString(),
    };
    
    return btoa(JSON.stringify(teamData));
  };

  const generateShareableUrl = () => {
    const teamCode = generateTeamCode();
    return `${window.location.origin}/?team=${teamCode}`;
  };

  const handleCopyUrl = async () => {
    const url = generateShareableUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Team composition link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = async () => {
    const code = generateTeamCode();
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code Copied!",
        description: "Team code has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExportJson = () => {
    const teamData = {
      name: teamName || 'Untitled Team',
      description: teamDescription,
      champions: currentTeam,
      totalCost: currentTeam.reduce((sum, pc) => sum + pc.champion.cost, 0),
      traits: [...new Set(currentTeam.flatMap(pc => pc.champion.traits))],
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(teamData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teamName || 'tft-team'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Team Exported!",
      description: "Team composition has been downloaded as JSON.",
    });
  };

  if (currentTeam.length === 0) {
    return (
      <Button variant="outline" disabled>
        <Share2 className="w-4 h-4 mr-2" />
        Share Team
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Team Composition
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name (Optional)</Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="My Awesome Team"
            />
          </div>
          
          <div>
            <Label htmlFor="team-description">Description (Optional)</Label>
            <Textarea
              id="team-description"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="Team strategy and notes..."
              rows={3}
            />
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Share Options</h4>
            <div className="space-y-2">
              <Button onClick={handleCopyUrl} className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Copy Shareable Link
              </Button>
              
              <Button onClick={handleCopyCode} variant="secondary" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Copy Team Code
              </Button>
              
              <Button onClick={handleExportJson} variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p className="font-medium mb-1">Team Summary:</p>
            <p>{currentTeam.length} champions • {currentTeam.reduce((sum, pc) => sum + pc.champion.cost, 0)} total cost</p>
            <p>Traits: {[...new Set(currentTeam.flatMap(pc => pc.champion.traits))].join(', ')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}