'use client';
import ThemeSwiper from '@/components/ThemeSwiper';
import Text from '@/components/Text';

export default function SettingsPage() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <Text 
        type="header" 
        level={2} 
        label="Settings" />
      <ThemeSwiper />
    </div>
  );
}