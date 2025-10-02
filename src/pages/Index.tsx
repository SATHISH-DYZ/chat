import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@/components/Auth';
import { ChatInterface } from '@/components/ChatInterface';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" 
           style={{ background: 'var(--gradient-aurora)' }}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return session ? <ChatInterface /> : <Auth />;
};

export default Index;
