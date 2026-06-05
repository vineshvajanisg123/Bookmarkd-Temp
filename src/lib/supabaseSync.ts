import { getSupabase, isSupabaseConfigured } from "./supabase";
import { Book, ReadingProfile, Recommendation } from "../types";

// Comprehensive PostgreSQL database schema definition for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- BOOKMARK'D FULL RELATIONAL BACKEND SCHEMA (SUPABASE POSTGRESQL)
-- Includes: users, reading_profiles, recommendations, bookshelf, mentor_messages, action_logs
-- =========================================================================

-- 1. Main authenticated/anonymous user records
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User analyzed Reading DNA profile configuration
CREATE TABLE IF NOT EXISTS public.reading_profiles (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  loved_book TEXT,
  hated_book TEXT,
  genre_preference TEXT,
  reading_style TEXT,
  goal TEXT,
  self_definition TEXT,
  archetype TEXT,
  traits TEXT[],
  reading_pace TEXT,
  genre_bias TEXT,
  summary TEXT,
  insight TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Curated dynamic book recommendations linked directly to a profile
CREATE TABLE IF NOT EXISTS public.recommendations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  subtitle TEXT,
  why_this_book TEXT,
  why_now TEXT,
  problem_it_solves TEXT,
  purchase_url TEXT,
  cover_color TEXT,
  cover_text_color TEXT,
  cover_style TEXT,
  cover_image TEXT,
  isbn TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User's personal bookshelf/reading registry persistent row
CREATE TABLE IF NOT EXISTS public.bookshelf (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  description TEXT,
  cover_color TEXT,
  cover_text_color TEXT,
  isbn TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Full logs of the chat interactions with the book companion mentor AI
CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Behavioral analytics logs gathering every micro-action or navigation trigger
CREATE TABLE IF NOT EXISTS public.action_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security (RLS) on all generated tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookshelf ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

-- Creating permissive policies to support seamless local testing and direct client authentication:
DROP POLICY IF EXISTS "Allow read-write access to users" ON public.users;
CREATE POLICY "Allow read-write access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read-write access to reading_profiles" ON public.reading_profiles;
CREATE POLICY "Allow read-write access to reading_profiles" ON public.reading_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read-write access to recommendations" ON public.recommendations;
CREATE POLICY "Allow read-write access to recommendations" ON public.recommendations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read-write access to bookshelf" ON public.bookshelf;
CREATE POLICY "Allow read-write access to bookshelf" ON public.bookshelf FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read-write access to mentor_messages" ON public.mentor_messages;
CREATE POLICY "Allow read-write access to mentor_messages" ON public.mentor_messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read-write access to action_logs" ON public.action_logs;
CREATE POLICY "Allow read-write access to action_logs" ON public.action_logs FOR ALL USING (true) WITH CHECK (true);
`;

// Helper to escape special characters for Primary Keys
function getRelationalSafeId(key: string): string {
  return key.trim().replace(/[^a-zA-Z0-9_\-+=.%]/g, "_").toLowerCase().substring(0, 80);
}

// 1. Sync User Registration details to Supabase database
export async function supabaseSaveUser(userId: string, email: string) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("users").upsert({
      id: userId,
      email: email || "anonymous@bookmarkd.internal",
      created_at: new Date().toISOString()
    });
    if (error) {
      console.warn("Supabase user registration sync warning:", error.message);
    } else {
      console.log("Supabase account synced successfully.");
    }
  } catch (err) {
    console.error("Supabase user save error:", err);
  }
}

// 2. Sync analyzed Reading DNA Profile + Recommendations to Supabase (Double-Write)
export async function supabaseSaveReadingProfile(userId: string, profile: ReadingProfile) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = getSupabase();
    
    // First, ensure the user table record exists as foreign key reference
    await supabaseSaveUser(userId, "anonymous@bookmarkd.internal");

    // Upsert the core reading profile
    const { error: profileError } = await supabase.from("reading_profiles").upsert({
      user_id: userId,
      loved_book: profile.lovedBook || "",
      hated_book: profile.hatedBook || "",
      genre_preference: profile.genrePreference || "",
      reading_style: profile.readingStyle || "",
      goal: profile.goal || "",
      self_definition: profile.selfDefinition || "",
      archetype: profile.archetype,
      traits: profile.traits || [],
      reading_pace: profile.reading_pace || "Medium",
      genre_bias: profile.genre_bias || "",
      summary: profile.summary || "",
      insight: profile.insight || "",
      updated_at: new Date().toISOString()
    });

    if (profileError) {
      console.warn("Supabase core profile save failed:", profileError.message);
      return;
    }

    // Upsert individual recommendations into the recommendations table
    if (profile.recommendations && profile.recommendations.length > 0) {
      for (const rec of profile.recommendations) {
        const cleanTitleId = getRelationalSafeId(rec.title);
        const recId = `${userId}_${cleanTitleId}`;
        
        const { error: recError } = await supabase.from("recommendations").upsert({
          id: recId,
          user_id: userId,
          title: rec.title,
          author: rec.author || "",
          subtitle: rec.subtitle || "",
          why_this_book: rec.whyThisBook || "",
          why_now: rec.whyNow || "",
          problem_it_solves: rec.problemItSolves || "",
          purchase_url: rec.purchaseUrl || "",
          cover_color: rec.coverColor || "",
          cover_text_color: rec.coverTextColor || "",
          cover_style: rec.coverStyle || "",
          cover_image: rec.coverImage || "",
          isbn: rec.isbn || "",
          created_at: new Date().toISOString()
        });

        if (recError) {
          console.warn(`Supabase recommendation insert warning for [${rec.title}]:`, recError.message);
        }
      }
    }
    console.log("Supabase profile & recommendations dual-write synchronized successfully!");
  } catch (err) {
    console.error("Supabase profile save error:", err);
  }
}

// 3. Assemble and retrieve ReadingProfile + associated recommendations
export async function supabaseGetReadingProfile(userId: string): Promise<ReadingProfile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = getSupabase();
    
    // Fetch core profile
    const { data: profile, error: profileError } = await supabase
      .from("reading_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.warn("Supabase fetch profile error:", profileError.message);
      return null;
    }

    if (!profile) return null;

    // Fetch related recommendations
    const { data: recs, error: recsError } = await supabase
      .from("recommendations")
      .select("*")
      .eq("user_id", userId);

    const recommendations: Recommendation[] = [];
    if (recs && !recsError) {
      recs.forEach((r) => {
        recommendations.push({
          title: r.title,
          author: r.author || "",
          subtitle: r.subtitle || "",
          whyThisBook: r.why_this_book || "",
          whyNow: r.why_now || "",
          problemItSolves: r.problem_it_solves || "",
          purchaseUrl: r.purchase_url || "",
          coverColor: r.cover_color || "",
          coverTextColor: r.cover_text_color || "",
          coverStyle: r.cover_style || "",
          coverImage: r.cover_image || "",
          isbn: r.isbn || ""
        });
      });
    }

    return {
      lovedBook: profile.loved_book || "",
      hatedBook: profile.hated_book || "",
      genrePreference: profile.genre_preference || "",
      readingStyle: profile.reading_style || "",
      goal: profile.goal || "",
      selfDefinition: profile.self_definition || "",
      archetype: profile.archetype,
      traits: profile.traits || [],
      reading_pace: profile.reading_pace || "Medium",
      genre_bias: profile.genre_bias || "",
      summary: profile.summary || "",
      insight: profile.insight || "",
      recommendations
    } as ReadingProfile;

  } catch (err) {
    console.error("Supabase load profile error:", err);
  }
  return null;
}

// 4. Save book selection to shared bookshelf table in Supabase
export async function supabaseSaveBookshelfBook(userId: string, book: Book) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = getSupabase();
    await supabaseSaveUser(userId, "anonymous@bookmarkd.internal");

    const cleanTitleId = getRelationalSafeId(book.title);
    const complexId = `${userId}_${cleanTitleId}`;

    const { error } = await supabase.from("bookshelf").upsert({
      id: complexId,
      user_id: userId,
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      cover_color: book.coverColor || "#4B564F",
      cover_text_color: book.coverTextColor || "#FBF7F0",
      isbn: book.isbn || "",
      added_at: new Date().toISOString()
    });

    if (error) {
      console.warn("Supabase bookshelf book upsert failed:", error.message);
    } else {
      console.log("Supabase book selection saved to cloud bookshelf.");
    }
  } catch (err) {
    console.error("Supabase bookshelf save book error:", err);
  }
}

// 5. Delete specific book selection from Supabase bookshelf
export async function supabaseDeleteBookshelfBook(userId: string, bookTitle: string) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = getSupabase();
    const cleanTitleId = getRelationalSafeId(bookTitle);
    const complexId = `${userId}_${cleanTitleId}`;

    const { error } = await supabase
      .from("bookshelf")
      .delete()
      .eq("id", complexId);

    if (error) {
      console.warn("Supabase bookshelf delete failed:", error.message);
    } else {
      console.log("Supabase book deleted from cloud database.");
    }
  } catch (err) {
    console.error("Supabase bookshelf delete book error:", err);
  }
}

// 6. Fetch user bookshelf catalog from Supabase
export async function supabaseGetBookshelfBooks(userId: string): Promise<Book[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bookshelf")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.warn("Supabase load bookshelf returned error:", error.message);
      return [];
    }

    if (data) {
      return data.map((row) => ({
        title: row.title,
        author: row.author,
        category: row.category,
        description: row.description,
        coverColor: row.cover_color,
        coverTextColor: row.cover_text_color,
        isbn: row.isbn || ""
      }));
    }
  } catch (err) {
    console.error("Supabase fetch bookshelf error:", err);
  }
  return [];
}

// 7. Save interactive conversations with the book companion mentor AI
export async function supabaseSaveMentorMessage(userId: string, messageId: string, role: "user" | "assistant", text: string) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = getSupabase();
    await supabaseSaveUser(userId, "anonymous@bookmarkd.internal");

    const cleanMsgId = getRelationalSafeId(messageId);
    const complexId = `${userId}_${cleanMsgId}`;

    const { error } = await supabase.from("mentor_messages").upsert({
      id: complexId,
      user_id: userId,
      role: role,
      message: text,
      sent_at: new Date().toISOString()
    });

    if (error) {
      console.warn("Supabase mentor conversation message sync warning:", error.message);
    } else {
      console.log("Supabase chat dialog logged.");
    }
  } catch (err) {
    console.error("Supabase save message error:", err);
  }
}

// 8. Event/action logger function representing real-time customer behavior trackings
export async function supabaseLogEvent(userId: string | undefined, eventName: string, metadata: any = {}) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = getSupabase();
    const targetUserId = userId || "anonymous-guest-id";

    // Create user placeholder first if we have a valid non-guest UID
    if (userId) {
      await supabaseSaveUser(userId, "anonymous@bookmarkd.internal");
    }

    const randomPortion = Math.random().toString(36).substring(2, 10);
    const eventId = `evt_${Date.now()}_${randomPortion}`;

    const { error } = await supabase.from("action_logs").insert({
      id: eventId,
      user_id: userId || null,
      event_name: eventName,
      metadata: metadata || {},
      triggered_at: new Date().toISOString()
    });

    if (error) {
      console.warn("Supabase Telemetry trace warn:", error.message);
    } else {
      console.log(`Supabase telemetry registered: [${eventName}]`);
    }
  } catch (err) {
    console.error("Supabase telemetry event logging crashed:", err);
  }
}
