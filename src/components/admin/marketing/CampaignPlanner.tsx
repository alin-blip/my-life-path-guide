import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  channel: string;
  goals: string[];
}

const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    title: 'Product Hunt Launch',
    description: 'Official launch on Product Hunt with teaser campaign leading up',
    status: 'scheduled',
    startDate: addDays(new Date(), 14),
    endDate: addDays(new Date(), 21),
    channel: 'Product Hunt',
    goals: ['#1 Product of the Day', '500 upvotes', '1000 signups'],
  },
  {
    id: '2',
    title: 'YouTube Content Series',
    description: '"Life Operating System" 5-part video series explaining the CORE 4 framework',
    status: 'active',
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    channel: 'YouTube',
    goals: ['10K views per video', '500 subscribers', '100 trial signups'],
  },
  {
    id: '3',
    title: 'Webinar: Success Without Sacrifice',
    description: 'Live webinar presenting the LifeOS methodology with live demo',
    status: 'draft',
    startDate: addDays(new Date(), 7),
    endDate: addDays(new Date(), 7),
    channel: 'Zoom/YouTube Live',
    goals: ['200 registrations', '100 live attendees', '20 conversions'],
  },
  {
    id: '4',
    title: 'Email Welcome Sequence',
    description: '7-day automated email sequence for new trial users',
    status: 'completed',
    startDate: addDays(new Date(), -30),
    endDate: addDays(new Date(), -23),
    channel: 'Email',
    goals: ['40% open rate', '15% click rate', '10% trial-to-paid'],
  },
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: AlertCircle, color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', icon: Clock, color: 'bg-blue-500/20 text-blue-500' },
  active: { label: 'Active', icon: Target, color: 'bg-green-500/20 text-green-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'bg-primary/20 text-primary' },
};

export const CampaignPlanner = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(SAMPLE_CAMPAIGNS);
  const [filter, setFilter] = useState<string | null>(null);

  const filteredCampaigns = filter
    ? campaigns.filter((c) => c.status === filter)
    : campaigns;

  const stats = {
    draft: campaigns.filter((c) => c.status === 'draft').length,
    scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    active: campaigns.filter((c) => c.status === 'active').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const count = stats[key as keyof typeof stats];
          return (
            <Card
              key={key}
              className={`cursor-pointer transition-colors ${
                filter === key ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setFilter(filter === key ? null : key)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {filter ? STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG].label : 'All'} Campaigns
          </h3>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredCampaigns.map((campaign) => {
            const statusConfig = STATUS_CONFIG[campaign.status];
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{campaign.title}</h4>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline">{campaign.channel}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {campaign.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(campaign.startDate, 'MMM d')} -{' '}
                          {format(campaign.endDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-2">Goals</p>
                      <div className="flex flex-col gap-1">
                        {campaign.goals.map((goal, i) => (
                          <Badge key={i} variant="secondary" className="text-xs justify-end">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Add */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Quick Add Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Campaign title..." />
            <Input type="date" />
          </div>
          <Textarea placeholder="Description and goals..." rows={2} />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
