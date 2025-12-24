import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { biz4MetricsService, WeeklyReport } from '@/services/biz4MetricsService';
import { 
  PenLine, MessageSquare, Send, Handshake, 
  Podcast, MonitorPlay, TrendingUp, Users, 
  Clock, Target, CheckCircle2, XCircle 
} from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

export const Biz4WeeklyReport: React.FC = () => {
  const { language } = useLanguage();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      try {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekStartStr = format(weekStart, 'yyyy-MM-dd');
        const data = await biz4MetricsService.getWeeklyReport(weekStartStr);
        setReport(data);
      } catch (error) {
        console.error('Error loading weekly report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6 text-center text-muted-foreground">
          {language === 'en' ? 'No data available for this week.' : 'Nu există date pentru această săptămână.'}
        </CardContent>
      </Card>
    );
  }

  const daysCompleted = report.completionByDay.filter(
    day => day.content && day.engage && day.outreach && day.close
  ).length;
  const completionRate = Math.round((daysCompleted / 7) * 100);

  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purple-300 mb-2">
              <PenLine className="h-4 w-4" />
              <span className="text-sm">{language === 'en' ? 'Content Created' : 'Conținut Creat'}</span>
            </div>
            <div className="text-2xl font-bold text-white">{report.totalContent}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-300 mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{language === 'en' ? 'Prospects' : 'Prospecți'}</span>
            </div>
            <div className="text-2xl font-bold text-white">{report.totalProspects}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-300 mb-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">{language === 'en' ? 'Deals Won' : 'Tranzacții'}</span>
            </div>
            <div className="text-2xl font-bold text-white">{report.totalDealsWon}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 border-amber-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-300 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{language === 'en' ? 'Conversion' : 'Conversie'}</span>
            </div>
            <div className="text-2xl font-bold text-white">{report.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Completion Grid */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {language === 'en' ? 'Daily Completion' : 'Completare Zilnică'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header row */}
            <div className="grid grid-cols-8 gap-2 text-sm text-muted-foreground">
              <div></div>
              {dayLabels.map(day => (
                <div key={day} className="text-center font-medium">{day}</div>
              ))}
            </div>

            {/* Content row */}
            <div className="grid grid-cols-8 gap-2 items-center">
              <div className="flex items-center gap-1 text-sm">
                <PenLine className="h-3 w-3" />
                <span className="hidden sm:inline">Content</span>
              </div>
              {dayLabels.map((_, idx) => {
                const dayData = report.completionByDay[idx];
                return (
                  <div key={idx} className="flex justify-center">
                    {dayData?.content ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Engage row */}
            <div className="grid grid-cols-8 gap-2 items-center">
              <div className="flex items-center gap-1 text-sm">
                <MessageSquare className="h-3 w-3" />
                <span className="hidden sm:inline">Engage</span>
              </div>
              {dayLabels.map((_, idx) => {
                const dayData = report.completionByDay[idx];
                return (
                  <div key={idx} className="flex justify-center">
                    {dayData?.engage ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Outreach row */}
            <div className="grid grid-cols-8 gap-2 items-center">
              <div className="flex items-center gap-1 text-sm">
                <Send className="h-3 w-3" />
                <span className="hidden sm:inline">Outreach</span>
              </div>
              {dayLabels.map((_, idx) => {
                const dayData = report.completionByDay[idx];
                return (
                  <div key={idx} className="flex justify-center">
                    {dayData?.outreach ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close row */}
            <div className="grid grid-cols-8 gap-2 items-center">
              <div className="flex items-center gap-1 text-sm">
                <Handshake className="h-3 w-3" />
                <span className="hidden sm:inline">Close</span>
              </div>
              {dayLabels.map((_, idx) => {
                const dayData = report.completionByDay[idx];
                return (
                  <div key={idx} className="flex justify-center">
                    {dayData?.close ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completion rate bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'en' ? 'Week Completion' : 'Completare Săptămână'}
              </span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Two Status */}
      <Card className="bg-gradient-to-r from-pink-900/30 to-pink-800/20 border-pink-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pink-300">
            {language === 'en' ? 'Weekly Two' : 'Weekly Two'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              report.podcastCompleted 
                ? 'bg-green-900/30 border border-green-700/50' 
                : 'bg-muted/20 border border-muted/30'
            }`}>
              <Podcast className={`h-6 w-6 ${report.podcastCompleted ? 'text-green-400' : 'text-muted-foreground'}`} />
              <div>
                <div className="font-medium">Podcast</div>
                <div className="text-sm text-muted-foreground">
                  {report.podcastCompleted 
                    ? (language === 'en' ? 'Completed' : 'Completat')
                    : (language === 'en' ? 'Not yet' : 'Încă nu')}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              report.webinarCompleted 
                ? 'bg-green-900/30 border border-green-700/50' 
                : 'bg-muted/20 border border-muted/30'
            }`}>
              <MonitorPlay className={`h-6 w-6 ${report.webinarCompleted ? 'text-green-400' : 'text-muted-foreground'}`} />
              <div>
                <div className="font-medium">Webinar</div>
                <div className="text-sm text-muted-foreground">
                  {report.webinarCompleted 
                    ? (language === 'en' ? 'Completed' : 'Completat')
                    : (language === 'en' ? 'Not yet' : 'Încă nu')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {language === 'en' ? 'Engagement Stats' : 'Statistici Engagement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{report.totalEngageMinutes}</div>
                <div className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Minutes engaged' : 'Minute engage'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{report.totalConversations}</div>
                <div className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Sales conversations' : 'Conversații vânzări'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
