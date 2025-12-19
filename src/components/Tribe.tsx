
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, UserPlus, Filter, Calendar } from 'lucide-react';

type Member = {
  id: string;
  name: string;
  role: string;
  joinDate: string;
  active: boolean;
  avatar: string;
};

export const Tribe = () => {
  const { toast } = useToast();
  
  // Sample data for tribe members
  const members: Member[] = [
    {
      id: '1',
      name: 'John Hill',
      role: 'Founder',
      joinDate: '2021-05-10',
      active: true,
      avatar: 'JH',
    },
    {
      id: '2',
      name: 'Maria Courage',
      role: 'Coach',
      joinDate: '2022-01-15',
      active: true,
      avatar: 'MC',
    },
    {
      id: '3',
      name: 'Robert Strength',
      role: 'Member',
      joinDate: '2022-03-22',
      active: false,
      avatar: 'RS',
    },
    {
      id: '4',
      name: 'Sarah Wisdom',
      role: 'Member',
      joinDate: '2022-04-05',
      active: true,
      avatar: 'SW',
    },
    {
      id: '5',
      name: 'Alex Truth',
      role: 'Member',
      joinDate: '2022-06-18',
      active: true,
      avatar: 'AT',
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const handleConnect = (memberId: string) => {
    toast({
      title: "Connection request sent",
      description: "Your request has been sent successfully.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white uppercase">TRIBE</h1>
        <Button className="bg-primary hover:bg-primary/80">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="mb-8">
        <div className="bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Find Tribe Members</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, skill, or location..."
                className="pl-9 bg-muted/30 border-muted/30"
              />
            </div>
            
            <Button variant="outline" className="bg-muted/30 border-muted/30">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Members</h2>
          <div className="text-sm text-muted-foreground">{members.length} members</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="bg-background rounded-lg p-4 border border-muted/30">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${member.active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Joined {formatDate(member.joinDate)}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-muted/30 hover:bg-primary hover:text-white"
                  onClick={() => handleConnect(member.id)}
                >
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
