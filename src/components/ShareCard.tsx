'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase-client';
import { Share } from '@/hooks/useProfile';
import Button from '@/components/Button';
import Text from '@/components/Text';

interface ShareCardProps {
  share: Share;
  isOwner: boolean;
  onDelete?: (id: string) => void;
}

export default function ShareCard({ share, isOwner, onDelete }: ShareCardProps) {
  const router = useRouter();
  const [forking, setForking] = useState(false);

  const handleView = () => {
    const base = window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? '');
    window.location.href = `${base}#/share/${share.id}`;
  };
  
  const handleFork = async () => {
    setForking(true);

    const { data, error } = await supabase
      .from('shares')
      .select('code, language, history')
      .eq('id', share.id)
      .single();

    if (error || !data) {
      console.error('Error forking share:', error?.message);
      setForking(false);
      return;
    }

    // Store in localStorage so the editor picks it up on load
    localStorage.setItem('forked_code', data.code);
    localStorage.setItem('forked_lang', data.language);
    setForking(false);
    router.push('/');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-3 border border-border bg-bg-surface p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-0.5 border border-border text-interactive bg-bg-element">
            {share.language}
          </span>
          <Text
            label={formatDate(share.created_at)}
            type="date"
            color="muted"
          />
        </div>

        <div className="flex gap-2">
          <Button
            label="View"
            size="sm"
            onClick={handleView}
          />
          <Button
            label={forking ? "Forking..." : "Fork"}
            size="sm"
            onClick={handleFork}
          />
          {isOwner && onDelete && (
            <Button
              label="Delete"
              size="sm"
              onClick={() => onDelete(share.id)}
            />
          )}
        </div>
      </div>

      {/* Code preview */}
      <pre className="text-xs font-mono text-fg-muted bg-bg-element border border-border p-3 overflow-x-auto max-h-32 rounded-none">
        <code>
          {share.code.slice(0, 300)}
          {share.code.length > 300 ? '\n...' : ''}
        </code>
      </pre>
    </div>
  );
}