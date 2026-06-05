import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  serverTimestamp, 
  query, 
  orderBy,
  getDocFromServer
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType, isOfflineMode } from "./firebase";
import { Book, ReadingProfile, SurveyState, Recommendation } from "../types";

// Sanitise inputs to make IDs bulletproof and 100% compliant with firestore.rules regex
export function getSafeId(key: string): string {
  return key.trim().replace(/[^a-zA-Z0-9_\-+=.%]/g, "_").substring(0, 100);
}

// 1. Initialize user document in cloud database
export async function syncUserProfile(userId: string, email: string) {
  if (isOfflineMode) {
    localStorage.setItem(`bookmarkd_user_${userId}`, JSON.stringify({ email, createdAt: new Date().toISOString() }));
    return;
  }
  const userRef = doc(db, "users", userId);
  try {
    // First, verify client is online or check connection as mandated by skill
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (e) {
      // Offline/unprovisioned errors - log and continue gracefully
    }

    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: email || "anonymous@bookmarkd.internal",
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

// 2. Fetch user's Reading DNA Profile from the cloud
export async function getReadingProfile(userId: string): Promise<ReadingProfile | null> {
  if (isOfflineMode) {
    const saved = localStorage.getItem(`bookmarkd_profile_${userId}`);
    return saved ? JSON.parse(saved) : null;
  }
  const profileRef = doc(db, "users", userId, "profiles", "current");
  try {
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        lovedBook: data.lovedBook || "",
        hatedBook: data.hatedBook || "",
        genrePreference: data.genrePreference || "",
        readingStyle: data.readingStyle || "",
        goal: data.goal || "",
        selfDefinition: data.selfDefinition || "",
        archetype: data.archetype,
        traits: data.traits || [],
        reading_pace: data.reading_pace || "Medium",
        genre_bias: data.genre_bias || "",
        summary: data.summary || "",
        insight: data.insight || "",
        recommendations: data.recommendations || []
      } as ReadingProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}/profiles/current`);
    return null;
  }
}

// 3. Save user's Reading DNA Profile to the cloud
export async function saveReadingProfile(userId: string, profile: ReadingProfile) {
  if (isOfflineMode) {
    localStorage.setItem(`bookmarkd_profile_${userId}`, JSON.stringify(profile));
    return;
  }
  const profileRef = doc(db, "users", userId, "profiles", "current");
  try {
    await setDoc(profileRef, {
      lovedBook: profile.lovedBook || "",
      hatedBook: profile.hatedBook || "",
      genrePreference: profile.genrePreference || "",
      readingStyle: profile.readingStyle || "",
      goal: profile.goal || "",
      selfDefinition: profile.selfDefinition || "",
      archetype: profile.archetype,
      traits: profile.traits || [],
      reading_pace: profile.reading_pace || "Medium",
      genre_bias: profile.genre_bias || "",
      summary: profile.summary || "",
      insight: profile.insight || "",
      recommendations: profile.recommendations || [],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/profiles/current`);
  }
}

// 4. Fetch user's bookshelf from the cloud
export async function getBookshelfBooks(userId: string): Promise<Book[]> {
  if (isOfflineMode) {
    const saved = localStorage.getItem(`bookmarkd_library_${userId}`) || localStorage.getItem("bookmarkd_library");
    return saved ? JSON.parse(saved) : [];
  }
  const colRef = collection(db, "users", userId, "bookshelf");
  try {
    const querySnap = await getDocs(colRef);
    const books: Book[] = [];
    querySnap.forEach((docSnap) => {
      const data = docSnap.data();
      books.push({
        title: data.title,
        author: data.author,
        category: data.category,
        description: data.description,
        coverColor: data.coverColor,
        coverTextColor: data.coverTextColor,
        isbn: data.isbn || ""
      });
    });
    return books;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/bookshelf`);
    return [];
  }
}

// 5. Add a single book to the user's cloud bookshelf
export async function saveBookshelfBook(userId: string, book: Book) {
  if (isOfflineMode) {
    const saved = localStorage.getItem(`bookmarkd_library_${userId}`) || localStorage.getItem("bookmarkd_library");
    const books: Book[] = saved ? JSON.parse(saved) : [];
    if (!books.some(b => b.title.toLowerCase() === book.title.toLowerCase())) {
      books.push(book);
      localStorage.setItem(`bookmarkd_library_${userId}`, JSON.stringify(books));
      localStorage.setItem("bookmarkd_library", JSON.stringify(books));
    }
    return;
  }
  const bookId = getSafeId(book.title);
  const docRef = doc(db, "users", userId, "bookshelf", bookId);
  try {
    await setDoc(docRef, {
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      coverColor: book.coverColor || "#4B564F",
      coverTextColor: book.coverTextColor || "#FBF7F0",
      isbn: book.isbn || "",
      addedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/bookshelf/${bookId}`);
  }
}

// 6. Delete a single book from the user's cloud bookshelf
export async function deleteBookshelfBook(userId: string, bookTitle: string) {
  if (isOfflineMode) {
    const saved = localStorage.getItem(`bookmarkd_library_${userId}`) || localStorage.getItem("bookmarkd_library");
    if (saved) {
      const books: Book[] = JSON.parse(saved);
      const filtered = books.filter(b => b.title.toLowerCase() !== bookTitle.toLowerCase());
      localStorage.setItem(`bookmarkd_library_${userId}`, JSON.stringify(filtered));
      localStorage.setItem("bookmarkd_library", JSON.stringify(filtered));
    }
    return;
  }
  const bookId = getSafeId(bookTitle);
  const docRef = doc(db, "users", userId, "bookshelf", bookId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/bookshelf/${bookId}`);
  }
}

// 7. Merge local/cached storage bookshelf logs with Cloud bookshelf to prevent any data loss
export async function syncLocalBookshelfWithCloud(userId: string, localBooks: Book[]): Promise<Book[]> {
  if (isOfflineMode) {
    return localBooks;
  }
  try {
    const cloudBooks = await getBookshelfBooks(userId);
    const mergedMap = new Map<string, Book>();

    // Put cloud items in map first
    cloudBooks.forEach(b => mergedMap.set(b.title.toLowerCase(), b));

    // Fill missing local items and push them to the cloud
    for (const b of localBooks) {
      if (!mergedMap.has(b.title.toLowerCase())) {
        mergedMap.set(b.title.toLowerCase(), b);
        await saveBookshelfBook(userId, b);
      }
    }

    return Array.from(mergedMap.values());
  } catch (e) {
    console.error("Bookshelf merge failed, returning local set:", e);
    return localBooks;
  }
}

// 8. Save chat history message
export async function saveChatMessage(userId: string, role: "user" | "model", text: string) {
  if (isOfflineMode) {
    const msgs = localStorage.getItem(`bookmarkd_chat_${userId}`) ? JSON.parse(localStorage.getItem(`bookmarkd_chat_${userId}`)!) : [];
    msgs.push({ role, text, timestamp: new Date().toISOString() });
    localStorage.setItem(`bookmarkd_chat_${userId}`, JSON.stringify(msgs));
    return;
  }
  const messageId = getSafeId(`${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const docRef = doc(db, "users", userId, "chatHistory", messageId);
  try {
    await setDoc(docRef, {
      role,
      text,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/chatHistory/${messageId}`);
  }
}

// 9. Fetch entire chat history for a user
export async function getChatHistory(userId: string): Promise<{role: "user" | "model", text: string}[]> {
  if (isOfflineMode) {
    const saved = localStorage.getItem(`bookmarkd_chat_${userId}`);
    return saved ? JSON.parse(saved) : [];
  }
  const colRef = collection(db, "users", userId, "chatHistory");
  const q = query(colRef, orderBy("timestamp", "asc"));
  try {
    const querySnap = await getDocs(q);
    const list: {role: "user" | "model", text: string}[] = [];
    querySnap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        role: data.role,
        text: data.text
      });
    });
    return list;
  } catch (error) {
    // If ordering failed (e.g., missing index warning), fetch unordered as safe fallback
    try {
      const fallbackSnap = await getDocs(colRef);
      const fallbackList: {role: "user" | "model", text: string}[] = [];
      fallbackSnap.forEach((docSnap) => {
        const data = docSnap.data();
        fallbackList.push({
          role: data.role,
          text: data.text
        });
      });
      return fallbackList;
    } catch (fallbackError) {
      handleFirestoreError(fallbackError, OperationType.LIST, `users/${userId}/chatHistory`);
      return [];
    }
  }
}

// 10. Record entire DNA survey submission form data filled by user
export async function saveSurveySubmission(userId: string, survey: SurveyState) {
  if (isOfflineMode) {
    localStorage.setItem(`bookmarkd_survey_${userId}`, JSON.stringify(survey));
    return;
  }
  const submissionId = getSafeId(`${Date.now()}_survey`);
  const docRef = doc(db, "users", userId, "surveySubmissions", submissionId);
  try {
    await setDoc(docRef, {
      lovedBook: survey.lovedBook || "",
      hatedBook: survey.hatedBook || "",
      genrePreference: survey.genrePreference || "",
      readingStyle: survey.readingStyle || "",
      goal: survey.goal || "",
      selfDefinition: survey.selfDefinition || "",
      submittedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/surveySubmissions/${submissionId}`);
  }
}

// 11. Record all recommended books shown to the user
export async function saveRecommendationsHistory(userId: string, recs: Recommendation[]) {
  if (isOfflineMode) {
    localStorage.setItem(`bookmarkd_recs_${userId}`, JSON.stringify(recs));
    return;
  }
  try {
    for (const rec of recs) {
      const recId = getSafeId(`${Date.now()}_${rec.title}`);
      const docRef = doc(db, "users", userId, "recsHistory", recId);
      await setDoc(docRef, {
        title: rec.title,
        author: rec.author,
        whyThisBook: rec.whyThisBook,
        whyNow: rec.whyNow,
        problemItSolves: rec.problemItSolves,
        recordedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/recsHistory`);
  }
}

// 12. Record call to actions and user interaction events (Clicks, Views, Actions)
export async function saveInteractionLog(
  userId: string,
  action: string,
  pageOrScreen: string,
  bookTitle?: string,
  author?: string
) {
  if (isOfflineMode) {
    return;
  }
  const interactionId = getSafeId(`${Date.now()}_interaction_${Math.random().toString(36).substring(2, 7)}`);
  const docRef = doc(db, "users", userId, "interactions", interactionId);
  try {
    const data: any = {
      action,
      pageOrScreen,
      timestamp: serverTimestamp()
    };
    if (bookTitle) data.bookTitle = bookTitle;
    if (author) data.author = author;
    
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/interactions/${interactionId}`);
  }
}

// 13. Record full audit trail of removed bookshelf books
export async function saveRemovedBook(userId: string, book: Book) {
  if (isOfflineMode) {
    const removed = localStorage.getItem(`bookmarkd_removed_${userId}`) ? JSON.parse(localStorage.getItem(`bookmarkd_removed_${userId}`)!) : [];
    removed.push(book);
    localStorage.setItem(`bookmarkd_removed_${userId}`, JSON.stringify(removed));
    return;
  }
  const bookId = getSafeId(book.title);
  const docRef = doc(db, "users", userId, "removedBooks", bookId);
  try {
    await setDoc(docRef, {
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      coverColor: book.coverColor || "",
      coverTextColor: book.coverTextColor || "",
      isbn: book.isbn || "",
      removedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/removedBooks/${bookId}`);
  }
}
