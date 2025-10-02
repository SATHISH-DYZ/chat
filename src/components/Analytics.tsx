import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  recentActivity: Array<{
    id: string;
    title: string;
    created_at: string;
    message_count: number;
  }>;
}

export const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (convError) throw convError;

      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('id, conversation_id')
        .in('conversation_id', conversations?.map(c => c.id) || []);

      if (msgError) throw msgError;

      const conversationCounts = conversations?.map(conv => ({
        ...conv,
        message_count: messages?.filter(m => m.conversation_id === conv.id).length || 0,
      })) || [];

      setAnalytics({
        totalConversations: conversations?.length || 0,
        totalMessages: messages?.length || 0,
        avgMessagesPerConversation: conversations?.length 
          ? Math.round((messages?.length || 0) / conversations.length) 
          : 0,
        recentActivity: conversationCounts.slice(0, 5),
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ background: 'var(--gradient-aurora)' }}>
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--gradient-aurora)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent" 
                style={{ backgroundImage: 'var(--gradient-primary)' }}>
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">View your chatbot usage statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-glow)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalConversations || 0}</div>
              <p className="text-xs text-muted-foreground">All-time conversations</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-glow)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground">Messages exchanged</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-glow)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Messages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.avgMessagesPerConversation || 0}</div>
              <p className="text-xs text-muted-foreground">Per conversation</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recentActivity.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 transition-[var(--transition-smooth)] hover:bg-secondary"
                >
                  <div>
                    <p className="font-medium">{conv.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm font-medium">{conv.message_count} messages</div>
                </div>
              ))}
              {analytics?.recentActivity.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No conversations yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
