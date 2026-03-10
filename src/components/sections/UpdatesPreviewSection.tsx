export type UpdateCategory =
  | 'R&D'
  | 'Prototype'
  | 'Testing'
  | 'Materials'
  | 'Software'
  | 'Manufacturing';

export interface UpdateItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string; // YYYY-MM-DD
  category: UpdateCategory;
  featured?: boolean;
  published?: boolean;
}

export const updates: UpdateItem[] = [
  // 先留空。以后直接在这里新增内容即可。
  // 示例：
  // {
  //   id: '1',
  //   slug: 'orthopedic-foam-testing',
  //   title: 'Orthopedic foam structure testing started',
  //   summary:
  //     'We are reviewing support balance, comfort, and durability across different dog sizes.',
  //   date: '2026-03-10',
  //   category: 'Prototype',
  //   featured: true,
  //   published: true,
  // },
];

export const featuredFallbackUpdates: UpdateItem[] = [
  {
    id: 'placeholder-1',
    slug: 'coming-soon-1',
    title: 'Product development updates coming soon',
    summary:
      'We will share R&D milestones, prototype refinements, and progress updates here.',
    date: '2026-03-10',
    category: 'R&D',
    featured: true,
    published: false,
  },
  {
    id: 'placeholder-2',
    slug: 'coming-soon-2',
    title: 'Prototype and testing milestones will be published here',
    summary:
      'This section will document how WoafyPet moves from concept to real product progress.',
    date: '2026-03-10',
    category: 'Testing',
    featured: true,
    published: false,
  },
];

export const getPublishedUpdates = () =>
  [...updates]
    .filter((item) => item.published !== false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const getFeaturedUpdates = () => {
  const published = getPublishedUpdates().filter((item) => item.featured);
  if (published.length > 0) return published.slice(0, 3);
  return featuredFallbackUpdates;
};