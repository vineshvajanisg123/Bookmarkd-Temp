import { useState, useEffect } from "react";
import { Book, SurveyState, ReadingProfile } from "./types";
import Screen1Welcome from "./components/Screen1Welcome";
import Screen2DnaCollection from "./components/Screen2DnaCollection";
import Screen3Loading from "./components/Screen3Loading";
import Screen4DnaResults from "./components/Screen4DnaResults";
import Screen5Recommendations from "./components/Screen5Recommendations";
import Screen6WanderTheStacks from "./components/Screen6WanderTheStacks";
import Screen7MyBookshelf from "./components/Screen7MyBookshelf";
import HeaderMenu from "./components/HeaderMenu";
import BookMentor from "./components/BookMentor";
import Screen0Login from "./components/Screen0Login";
import { BookOpen } from "lucide-react";
import { calculateFallbackProfile } from "./data/fallbackDNA";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User, signInAnonymously } from "firebase/auth";
import { auth, isOfflineMode } from "./lib/firebase";
import { 
  syncUserProfile, 
  getReadingProfile, 
  saveReadingProfile, 
  saveBookshelfBook, 
  deleteBookshelfBook, 
  syncLocalBookshelfWithCloud,
  saveSurveySubmission,
  saveRecommendationsHistory,
  saveInteractionLog,
  saveRemovedBook
} from "./lib/dbSync";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [surveyData, setSurveyData] = useState<SurveyState | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingProfile | null>(null);

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auto-scroll to top upon screen navigation to prevent retaining scroll positions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, [activeScreen]);

  // Initialize library volumes with local cache support
  const [libraryBooks, setLibraryBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem("bookmarkd_library");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        title: "Quiet",
        author: "Susan Cain",
        category: "Psychology",
        description: "A beautiful, research-backed defense of introversion in a high-stimulus society that can never seem to stop speaking.",
        coverColor: "#4B564F",
        coverTextColor: "#FBF7F0",
        isbn: "0241145897"
      },
      {
        title: "Stolen Focus",
        author: "Johann Hari",
        category: "Psychology",
        description: "Johann Hari investigates the alarming cognitive crisis of our declining attention spans, proving focus hasn't just been lost—it was stolen.",
        coverColor: "#45314D",
        coverTextColor: "#F8F6F1",
        isbn: "1526620216"
      },
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        category: "Decision Making",
        description: "Daniel Kahneman's seminal masterwork maps the twin cognitive systems (System 1 and System 2) that govern judgment and choice.",
        coverColor: "#3F2E2E",
        coverTextColor: "#FAF6F0",
        isbn: "0374275632"
      },
      {
        title: "Flow",
        author: "Mihaly Csikszentmihalyi",
        category: "Psychology",
        description: "The classic study of optimal experience, mapping how total absorption in a challenging task triggers high fulfillment.",
        coverColor: "#2A3A40",
        coverTextColor: "#EAE6DF",
        isbn: "0061339202"
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self-Improvement",
        description: "James Clear designs a gorgeous system demonstrating how small behavior revisions compound into immense life outcomes.",
        coverColor: "#2C3E35",
        coverTextColor: "#F1EFEA",
        isbn: "0735211299"
      },
      {
        title: "Blink",
        author: "Malcolm Gladwell",
        category: "Decision Making",
        description: "Malcolm Gladwell investigates the power of the subconscious mind to execute split-second, highly intuitive selections.",
        coverColor: "#1F3B2E",
        coverTextColor: "#F6F3EB",
        isbn: "0316010669"
      }
    ];
  });

  // Track and synchronize authenticated session on boot
  useEffect(() => {
    const savedCustomUserStr = localStorage.getItem("bookmarkd_custom_user");
    if (savedCustomUserStr) {
      try {
        const customUser = JSON.parse(savedCustomUserStr);
        setUser(customUser);
        setAuthLoading(true);

        const localSaved = localStorage.getItem(`bookmarkd_library_${customUser.uid}`) || localStorage.getItem("bookmarkd_library");
        if (localSaved) {
          try {
            setLibraryBooks(JSON.parse(localSaved));
          } catch (e) {}
        }

        // Try getting profile local first
        const localProfileString = localStorage.getItem(`bookmarkd_profile_${customUser.uid}`);
        if (localProfileString) {
          try {
            const dbProfile = JSON.parse(localProfileString);
            setReadingProfile(dbProfile);
            setSurveyData({
              lovedBook: dbProfile.lovedBook || "",
              hatedBook: dbProfile.hatedBook || "",
              genrePreference: (dbProfile.genrePreference || "") as any,
              readingStyle: (dbProfile.readingStyle || "") as any,
              goal: (dbProfile.goal || "") as any,
              selfDefinition: dbProfile.selfDefinition || ""
            });
          } catch (e) {}
        } else {
          // Fallback to cloud query
          getReadingProfile(customUser.uid).then(dbProfile => {
            if (dbProfile) {
              setReadingProfile(dbProfile);
              setSurveyData({
                lovedBook: dbProfile.lovedBook || "",
                hatedBook: dbProfile.hatedBook || "",
                genrePreference: (dbProfile.genrePreference || "") as any,
                readingStyle: (dbProfile.readingStyle || "") as any,
                goal: (dbProfile.goal || "") as any,
                selfDefinition: dbProfile.selfDefinition || ""
              });
            }
          }).catch(console.error);
        }
      } catch (err) {
        console.error("Hydration of custom user session failed:", err);
      } finally {
        setAuthLoading(false);
      }
    } else {
      setUser(null);
      setAuthLoading(false);
    }
  }, []);

  // Synchronise page navigation / screen change tracking
  useEffect(() => {
    if (user) {
      saveInteractionLog(user.uid, "view_screen", `Screen_${activeScreen}`).catch(console.error);
    }
  }, [activeScreen, user]);

  const logInteraction = (action: string, bookTitle?: string, author?: string) => {
    if (user) {
      saveInteractionLog(user.uid, action, `Screen_${activeScreen}`, bookTitle, author).catch(console.error);
    }
  };

  const handleLogin = async () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async (userData: { email: string; displayName: string; uid: string }) => {
    // Commit custom session keys to localStorage for recovery on boot
    localStorage.setItem("bookmarkd_custom_user", JSON.stringify(userData));

    const loggedUser = {
      uid: userData.uid,
      isAnonymous: false,
      email: userData.email,
      displayName: userData.displayName
    } as any;
    setUser(loggedUser);
    setAuthLoading(true);

    try {
      // Synchronous dual write / profile initialization
      await syncUserProfile(userData.uid, userData.email);

      // Hydrate bookshelf from data store / cloud
      const cloudBooks = await syncLocalBookshelfWithCloud(userData.uid, []);
      setLibraryBooks(cloudBooks);
      localStorage.setItem(`bookmarkd_library_${userData.uid}`, JSON.stringify(cloudBooks));

      const dbProfile = await getReadingProfile(userData.uid);
      if (dbProfile) {
        setReadingProfile(dbProfile);
        setSurveyData({
          lovedBook: dbProfile.lovedBook || "",
          hatedBook: dbProfile.hatedBook || "",
          genrePreference: (dbProfile.genrePreference || "") as any,
          readingStyle: (dbProfile.readingStyle || "") as any,
          goal: (dbProfile.goal || "") as any,
          selfDefinition: dbProfile.selfDefinition || ""
        });
        localStorage.setItem(`bookmarkd_profile_${userData.uid}`, JSON.stringify(dbProfile));
      } else {
        setReadingProfile(null);
        setSurveyData(null);
      }
    } catch (err) {
      console.error("Authenticated post-login synchronization failed:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    
    localStorage.removeItem("bookmarkd_custom_user");
    
    try {
      if (!isOfflineMode) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("Sign out failed:", e);
    }

    setUser(null);
    setSurveyData(null);
    setReadingProfile(null);

    const defaultBooks = [
      {
        title: "Quiet",
        author: "Susan Cain",
        category: "Psychology",
        description: "A beautiful, research-backed defense of introversion in a high-stimulus society that can never seem to stop speaking.",
        coverColor: "#4B564F",
        coverTextColor: "#FBF7F0",
        isbn: "0241145897"
      },
      {
        title: "Stolen Focus",
        author: "Johann Hari",
        category: "Psychology",
        description: "Johann Hari investigates the alarming cognitive crisis of our declining attention spans, proving focus hasn't just been lost—it was stolen.",
        coverColor: "#45314D",
        coverTextColor: "#F8F6F1",
        isbn: "1526620216"
      },
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        category: "Decision Making",
        description: "Daniel Kahneman's seminal masterwork maps the twin cognitive systems (System 1 and System 2) that govern judgment and choice.",
        coverColor: "#3F2E2E",
        coverTextColor: "#FAF6F0",
        isbn: "0374275632"
      }
    ];

    setLibraryBooks(defaultBooks);
    setActiveScreen(1);
    setAuthLoading(false);
  };

  const toggleBookLibrary = (book: Book) => {
    const exists = libraryBooks.some((b) => b.title.toLowerCase() === book.title.toLowerCase());
    let updated;
    if (exists) {
      updated = libraryBooks.filter((b) => b.title.toLowerCase() !== book.title.toLowerCase());
      if (user) {
        deleteBookshelfBook(user.uid, book.title).catch(console.error);
        const foundBook = libraryBooks.find((b) => b.title.toLowerCase() === book.title.toLowerCase());
        const bookToLog = foundBook || book;
        saveRemovedBook(user.uid, bookToLog).catch(console.error);
        saveInteractionLog(user.uid, "remove_from_bookshelf", `Screen_${activeScreen}`, bookToLog.title, bookToLog.author).catch(console.error);
      }
    } else {
      updated = [...libraryBooks, book];
      if (user) {
        saveBookshelfBook(user.uid, book).catch(console.error);
        saveInteractionLog(user.uid, "add_to_bookshelf", `Screen_${activeScreen}`, book.title, book.author).catch(console.error);
      }
    }
    setLibraryBooks(updated);
    localStorage.setItem("bookmarkd_library", JSON.stringify(updated));
  };

  // Restart the process entirely
  const handleReset = () => {
    setSurveyData(null);
    setReadingProfile(null);
    setActiveScreen(2);
  };

  // When Screen 2 Conversational form is completed
  const handleSurveySubmit = async (formData: SurveyState) => {
    setSurveyData(formData);
    // Transition straight into the cinematic loading Screen 3
    setActiveScreen(3);

    if (user) {
      saveSurveySubmission(user.uid, formData).catch(console.error);
    }

    // Call back-end server endpoint in background to run custom Gemini analysis
    try {
      const response = await fetch("/api/reading-dna", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to compile Profile");
      }

      const result = await response.json();
      setReadingProfile(result);
      if (user) {
        await saveReadingProfile(user.uid, result);
        saveRecommendationsHistory(user.uid, result.recommendations).catch(console.error);
      }
    } catch (e) {
      console.error("Failed to generate custom Reading DNA from backend. Fetching offline failsafe coordinates:", e);
      // Perfect client-side calculation fallback for static hosting/Netlify environments:
      const calculatedProfile = calculateFallbackProfile(
        formData.lovedBook,
        formData.genrePreference,
        formData.readingStyle,
        formData.goal,
        formData.selfDefinition
      );
      setReadingProfile(calculatedProfile);
      if (user) {
        await saveReadingProfile(user.uid, calculatedProfile);
        saveRecommendationsHistory(user.uid, calculatedProfile.recommendations).catch(console.error);
      }
    }
  };

  // Transition to results screen once the 5s loading concludes
  const handleLoadingFinished = () => {
    setActiveScreen(4);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#365947] flex items-center justify-center animate-pulse">
          <BookOpen className="text-white w-5 h-5 animate-spin" style={{ animationDuration: "5s" }} />
        </div>
        <p className="font-serif italic text-xs text-[#5E5A55] tracking-tight animate-pulse">
          Consulting the literary vault...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Screen0Login onSuccess={handleAuthSuccess} />
    );
  }

  return (
    <div className="bg-[#FAF6F0] min-h-screen flex flex-col">
      {activeScreen !== 3 && (
        <HeaderMenu
          activeScreen={activeScreen}
          onHome={() => setActiveScreen(1)}
          onBegin={handleReset}
          onDiscover={() => setActiveScreen(6)}
          onBookshelf={() => setActiveScreen(7)}
          onLogin={handleLogin}
          onLogout={handleLogout}
          loggedInUser={user}
        />
      )}
      
      <div className="flex-1">
        {activeScreen === 1 && (
          <Screen1Welcome
            onBegin={() => setActiveScreen(2)}
            onExploreStacks={() => setActiveScreen(6)}
            libraryBooks={libraryBooks}
            onOpenFullBookshelf={() => setActiveScreen(7)}
            onRemoveFromLibrary={toggleBookLibrary}
          />
        )}

        {activeScreen === 2 && (
          <Screen2DnaCollection
            onSubmit={handleSurveySubmit}
            onBack={() => setActiveScreen(1)}
          />
        )}

        {activeScreen === 3 && (
          <Screen3Loading
            lovedBook={surveyData?.lovedBook || "Selected Volume"}
            onFinished={handleLoadingFinished}
          />
        )}

        {activeScreen === 4 && (
          <Screen4DnaResults
            archetype={readingProfile?.archetype || "GROWTH ARCHITECT"}
            traits={readingProfile?.traits || ["GROWTH ORIENTED", "PRACTICAL BUILDER", "STRATEGIC EYE"]}
            readingPace={readingProfile?.reading_pace ? `${readingProfile.reading_pace} Pace` : "Fast Pace"}
            genreBias={readingProfile?.genre_bias || "Non-Fiction"}
            summary={readingProfile?.summary || "You build structural models for executing changes."}
            insight={readingProfile?.insight || "We noticed you gravitate toward actionable work."}
            onContinue={() => setActiveScreen(5)}
            onHome={() => setActiveScreen(1)}
          />
        )}

        {activeScreen === 5 && (
          <Screen5Recommendations
            archetype={readingProfile?.archetype || "GROWTH ARCHITECT"}
            recommendations={readingProfile?.recommendations || []}
            onWander={() => setActiveScreen(6)}
            onReset={handleReset}
            onHome={() => setActiveScreen(1)}
            libraryBooks={libraryBooks}
            onToggleLibrary={toggleBookLibrary}
            onLogInteraction={logInteraction}
          />
        )}

        {activeScreen === 6 && (
          <Screen6WanderTheStacks
            onBackToResults={readingProfile ? () => setActiveScreen(5) : undefined}
            hasProfile={!!readingProfile}
            onHome={() => setActiveScreen(1)}
            libraryBooks={libraryBooks}
            onToggleLibrary={toggleBookLibrary}
            onLogInteraction={logInteraction}
          />
        )}

        {activeScreen === 7 && (
          <Screen7MyBookshelf
            libraryBooks={libraryBooks}
            onRemoveBook={toggleBookLibrary}
            onHome={() => setActiveScreen(1)}
            onExplore={() => setActiveScreen(6)}
            userId={user?.uid}
          />
        )}
      </div>
      <BookMentor libraryBooks={libraryBooks} onToggleLibrary={toggleBookLibrary} userId={user?.uid} />
    </div>
  );
}
