'use client';

import { Badge } from '@/components/ui/badge';
import { DURUMLAR, type DurumValue } from '@/lib/constants';

interface StatusBadgeProps {
  durum: DurumValue;
  className?: string;
}

const durumStyles: Record<DurumValue, string> = {
  yeni: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  islemde: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
  cozuldu: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
  cozulemedi: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100',
};

export function StatusBadge({ durum, className }: StatusBadgeProps) {
  const durumObj = DURUMLAR.find((d) => d.value === durum);
  if (!durumObj) return null;

  return (
    <Badge
      variant="outline"
      className={`${durumStyles[durum]} font-medium text-xs gap-1 ${className || ''}`}
    >
      <span>{durumObj.emoji}</span>
      {durumObj.label}
    </Badge>
  );
}
