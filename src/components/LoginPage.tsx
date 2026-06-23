'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase-client';
import Auth from '@/components/Auth';

export default function LoginPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push('/');
      } else {
        setChecked(true);
      }
    });
  }, [router]);

  if (!checked) return null;

  return <Auth />;
}