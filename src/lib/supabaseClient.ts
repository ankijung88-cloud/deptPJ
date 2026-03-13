// This file is a safe placeholder to prevent runtime crashes after Supabase removal.
// All functionality has been migrated to the AWS Lightsail backend (fetch API).

const noop = () => Promise.resolve({ data: [], error: null });
const noopSingle = () => Promise.resolve({ data: null, error: null });

export const supabase = {
    from: () => ({
        select: () => ({
            eq: () => ({
                order: noop,
                single: noopSingle,
                ...noop()
            }),
            order: noop,
            single: noopSingle,
            ...noop()
        }),
        insert: noop,
        update: noop,
        delete: noop,
    }),
    auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: noopSingle,
        signOut: noop,
    },
    storage: {
        from: () => ({
            getPublicUrl: (path: string) => ({ data: { publicUrl: '' } })
        })
    }
} as any;

export const SUPABASE_MEDIA_URL = '';
