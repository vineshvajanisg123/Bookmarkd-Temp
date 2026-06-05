export interface Book {
  title: string;
  author: string;
  category: string;
  description: string;
  coverImage?: string;
  coverColor?: string; // Hex color for CSS cover designs
  coverTextColor?: string;
  amazonUrl?: string;
  isbn?: string;
}

export interface SurveyState {
  lovedBook: string;
  hatedBook: string;
  genrePreference: string;
  readingStyle: "Fast and engaging" | "Deep and thoughtful" | "";
  goal: string;
  selfDefinition: string;
}

export interface Recommendation {
  title: string;
  author: string;
  subtitle?: string;
  whyThisBook: string;
  whyNow: string;
  problemItSolves: string;
  purchaseUrl: string;
  coverColor?: string;
  coverTextColor?: string;
  coverStyle?: string;
  coverImage?: string;
  isbn?: string;
}

export interface ReadingProfile {
  archetype: string;
  traits: string[];
  reading_pace: "Slow" | "Medium" | "Fast";
  genre_bias: string;
  summary: string;
  insight: string;
  recommendations: Recommendation[];
  lovedBook?: string;
  hatedBook?: string;
  genrePreference?: string;
  readingStyle?: string;
  goal?: string;
  selfDefinition?: string;
}

export interface CuratedShelf {
  name: string;
  description: string;
  books: Book[];
}
