import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from '@/lib/icons/iconService';

export type SortOption = 'all' | 'outline' | 'solid' | 'thin' | 'duotone' | 'bold' | 'others';

interface StyleCount {
  style: SortOption;
  count: number;
}

interface SortFilterProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
  totalIcons?: number;
  styleCounts?: StyleCount[];
}

const SortFilter: React.FC<SortFilterProps> = ({ value, onValueChange, totalIcons, styleCounts = [] }) => {
  const getCount = (style: SortOption) => {
    const count = styleCounts.find(s => s.style === style)?.count ?? 0;
    return ` (${count})`;
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] h-8 text-xs">
        <SelectValue placeholder="Filter by style" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Styles {totalIcons ? `(${totalIcons})` : '(0)'}</SelectItem>
        <SelectItem value="outline">Outline Icons{getCount('outline')}</SelectItem>
        <SelectItem value="solid">Solid Icons{getCount('solid')}</SelectItem>
        <SelectItem value="thin">Thin Icons{getCount('thin')}</SelectItem>
        <SelectItem value="duotone">Duotone Icons{getCount('duotone')}</SelectItem>
        <SelectItem value="bold">Bold Icons{getCount('bold')}</SelectItem>
        <SelectItem value="others">Other Styles{getCount('others')}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortFilter; 