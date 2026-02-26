import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import {
    NAV_ITEMS,
    FLOOR_CATEGORIES,
    FEATURED_ITEMS,
    ARTISTS_OF_THE_YEAR,
    CALENDAR_EVENTS,
    BRAND_SPOTLIGHTS,
    LIVE_SHORTS
} from '../src/data/mockData.ts'; // Ensure your tsconfig output allows ES module import or run via ts-node

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    console.log('Starting Supabase data seed...');

    // 1. Seed NAV_ITEMS
    console.log('Seeding NAV_ITEMS...');
    for (const item of NAV_ITEMS) {
        const { error } = await supabase.from('nav_items').upsert({
            id: item.id,
            href: item.href,
            subitems: item.subitems
        });
        if (error) console.error(`Error inserting nav_item ${item.id}:`, error);
    }

    // 2. Seed FLOOR_CATEGORIES (Korean base text only)
    console.log('Seeding FLOOR_CATEGORIES...');
    for (const category of FLOOR_CATEGORIES) {
        const { error } = await supabase.from('floor_categories').upsert({
            id: category.id,
            floor: category.floor,
            title: category.title.ko, // Extract base language
            description: category.description.ko, // Extract base language
            bg_image: category.bgImage,
            content: category.content ? category.content.map(c => ({
                type: c.type,
                value: c.value.ko // Extract base language for content
            })) : [],
            subitems: category.subitems ? category.subitems.map(sub => ({
                id: sub.id,
                label: typeof sub.label === 'string' ? sub.label : sub.label.ko // Extract base language for labels
            })) : []
        });
        if (error) console.error(`Error inserting floor_category ${category.id}:`, error);
    }

    // 3. Seed FEATURED_ITEMS (Korean base text only)
    console.log('Seeding FEATURED_ITEMS...');
    for (const item of FEATURED_ITEMS) {
        const { error } = await supabase.from('featured_items').upsert({
            id: item.id,
            title: typeof item.title === 'string' ? item.title : item.title.ko,
            category: item.category,
            subcategory: item.subcategory,
            description: typeof item.description === 'string' ? item.description : item.description.ko,
            image_url: item.imageUrl,
            event_date: typeof item.date === 'string' ? item.date : item.date?.ko,
            location: typeof item.location === 'string' ? item.location : item.location?.ko,
            price: typeof item.price === 'string' ? item.price : item.price?.ko
        });
        if (error) console.error(`Error inserting featured_item ${item.id}:`, error);
    }

    // 4. Seed ARTISTS_OF_THE_YEAR (Korean base text only)
    console.log('Seeding ARTISTS...');
    for (const artist of ARTISTS_OF_THE_YEAR) {
        const { error } = await supabase.from('artists').upsert({
            id: artist.id,
            name: typeof artist.name === 'string' ? artist.name : artist.name.ko,
            artist_type: typeof artist.type === 'string' ? artist.type : artist.type.ko,
            description: typeof artist.description === 'string' ? artist.description : artist.description.ko,
            image_url: artist.imageUrl,
            subcategory: artist.subcategory
        });
        if (error) console.error(`Error inserting artist ${artist.id}:`, error);
    }

    // 5. Seed CALENDAR_EVENTS (Korean base text only)
    console.log('Seeding CALENDAR_EVENTS...');
    for (const event of CALENDAR_EVENTS) {
        const { error } = await supabase.from('calendar_events').upsert({
            id: event.id,
            event_date: event.date,
            title: typeof event.title === 'string' ? event.title : event.title.ko,
            category: event.category,
            image_url: event.imageUrl
        });
        if (error) console.error(`Error inserting calendar_event ${event.id}:`, error);
    }

    // 6. Seed BRAND_SPOTLIGHTS (Korean base text only)
    console.log('Seeding BRAND_SPOTLIGHTS...');
    for (const brand of BRAND_SPOTLIGHTS) {
        const { error } = await supabase.from('brand_spotlights').upsert({
            id: brand.id,
            brand_name: typeof brand.brandName === 'string' ? brand.brandName : brand.brandName.ko,
            title: typeof brand.title === 'string' ? brand.title : brand.title.ko,
            description: typeof brand.description === 'string' ? brand.description : brand.description.ko,
            image_url: brand.imageUrl,
            tags: brand.tags.map(t => typeof t === 'string' ? t : t.ko)
        });
        if (error) console.error(`Error inserting brand_spotlight ${brand.id}:`, error);
    }

    // 7. Seed LIVE_SHORTS (Korean base text only)
    console.log('Seeding LIVE_SHORTS...');
    for (const short of LIVE_SHORTS) {
        const { error } = await supabase.from('live_shorts').upsert({
            id: short.id,
            title: typeof short.title === 'string' ? short.title : short.title.ko,
            video_url: short.videoUrl,
            location: typeof short.location === 'string' ? short.location : short.location.ko,
            view_count: short.viewCount
        });
        if (error) console.error(`Error inserting live_short ${short.id}:`, error);
    }

    console.log('Seed process completed.');
}

seedData();
