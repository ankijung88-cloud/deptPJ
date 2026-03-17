export type LocalizedString = string | {
    ko: string;
    en?: string;
    ja?: string;
    zh?: string;
    [key: string]: string | undefined;
};

export interface NavItem {
    id: string; // Translation key
    href: string;
    subitems?: {
        id: string;
        label: string;
        href: string;
    }[];
}

export interface FeaturedItem {
    id: string;
    title: LocalizedString;
    category: string;
    subcategory?: string;
    description: LocalizedString;
    imageUrl: string;
    thumbnailUrl?: string;
    date: LocalizedString;
    location: LocalizedString;
    price: LocalizedString;
    closedDays?: string[];
    videoUrl?: string;
    pageType?: 'sale' | 'exhibit' | 'booking' | 'promo';
    user_id?: string;
    eventDates?: string[]; // YYYY-MM-DD format
}

export interface FloorContent {
    type: 'text' | 'image' | 'video';
    value: string | LocalizedString;
    caption?: LocalizedString;
}

export interface FloorCategory {
    id: string;
    floor: string;
    title: LocalizedString;
    description: LocalizedString;
    bgImage: string;
    color?: string;
    videoUrl?: string;
    content?: FloorContent[];
    subitems?: {
        id: string;
        label: LocalizedString;
        bgImage?: string;
    }[];
}

export interface Artist {
    id: string;
    name: LocalizedString;
    type: LocalizedString; // Professional field
    description: LocalizedString;
    imageUrl: string;
    subcategory: string;
}

export interface CalendarEvent {
    id: string;
    date: string; // ISO format or YYYY-MM-DD
    title: LocalizedString;
    category: string;
    imageUrl?: string;
}

export interface BrandSpotlight {
    id: string;
    brandName: LocalizedString;
    title: LocalizedString;
    description: LocalizedString;
    imageUrl: string;
    videoUrl?: string;
    tags: LocalizedString[];
}

export interface Notice {
    id: number | string;
    title: LocalizedString;
    content: LocalizedString;
    category: string;
    date: string;
    is_important: boolean;
}

export interface FAQ {
    id: number | string;
    question: LocalizedString;
    answer: LocalizedString;
    category?: string;
    display_order?: number;
}
