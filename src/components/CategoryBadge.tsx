import { Category, CATEGORY_BG_COLORS, CATEGORY_ICONS } from '@/types';

interface Props {
  category: Category;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, showIcon = true, size = 'md' }: Props) {
  const colorClass = CATEGORY_BG_COLORS[category];
  const icon = CATEGORY_ICONS[category];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${sizeClass}`}
    >
      {showIcon && <span>{icon}</span>}
      {category}
    </span>
  );
}
