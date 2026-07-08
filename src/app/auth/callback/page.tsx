'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase-client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error.message);
        router.push('/login');
        return;
      }

      if (data.session) {
        router.push('/');
      } else {
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main className="c-page-layout flex items-center justify-center">
      <p className="text-fg font-mono text-sm">Confirming your account...</p>
    </main>
  );
}