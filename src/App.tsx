import { useState, useEffect } from 'react';
import Button from "@/components/Button";
import LoginPage from '@/components/LoginPage';
import { supabase } from "@/supabase-client";

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {session ? (
        <>
          <Button 
            label="Log Out" 
            onClick={logout} 
          />
        </>
      ) : (
        <LoginPage />
      )}
    </>
  );
}

export default App;