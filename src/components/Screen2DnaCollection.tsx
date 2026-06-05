import { useState } from "react";
import { BookOpen, BookMinus, Sparkles, Plus, Trash2 } from "lucide-react";
import { SurveyState } from "../types";

interface Screen2DnaCollectionProps {
  onSubmit: (state: SurveyState) => void;
  onBack: () => void;
}

export default function Screen2DnaCollection({ onSubmit, onBack }: Screen2DnaCollectionProps) {
  const [lovedBooks, setLovedBooks] = useState<string[]>([""]);
  const [hatedBooks, setHatedBooks] = useState<string[]>([""]);

  const [formData, setFormData] = useState<Omit<SurveyState, "lovedBook" | "hatedBook">>({
    genrePreference: "",
    readingStyle: "",
    goal: "",
    selfDefinition: "",
  });

  // Validation checks as required - first field of lovedBook must be filled
  const isFormFullyValid = 
    lovedBooks[0]?.trim().length > 0 && 
    formData.genrePreference !== "" && 
    formData.readingStyle !== "" && 
    formData.goal !== "" &&
    formData.selfDefinition !== "";

  const handleFormSubmit = () => {
    if (!isFormFullyValid) return;

    // Filter out completely blank inputs and join them as comma-separated values to protect upstream type system
    const lovedCombined = lovedBooks.filter((b) => b.trim() !== "").join(", ");
    const hatedCombined = hatedBooks.filter((b) => b.trim() !== "").join(", ");

    onSubmit({
      lovedBook: lovedCombined,
      hatedBook: hatedCombined,
      genrePreference: formData.genrePreference,
      readingStyle: formData.readingStyle,
      goal: formData.goal,
      selfDefinition: formData.selfDefinition,
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 md:px-12 flex flex-col justify-between" id="collection-screen">
      {/* Back button */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="font-mono text-[10px] tracking-widest uppercase text-brand-muted hover:text-brand-accent transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
        >
          ← Go Back
        </button>
      </div>

      {/* Hero Headline and Subheadline style from Screen 2 guideline */}
      <div className="space-y-3 text-center md:text-left mb-10 pb-6 border-b border-brand-border/60">
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#365947] font-bold block">
          BUILD YOUR READING DNA
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-text font-bold leading-tight">
          Let's understand your reading taste.
        </h1>
        <p className="font-sans text-sm text-brand-muted font-light">
          This takes less than 30 seconds.
        </p>
      </div>

      {/* Questionnaire Form */}
      <div className="space-y-10">
        {/* QUESTION 1 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="font-mono text-sm font-bold text-[#E07A5F] bg-[#E07A5F]/5 rounded-sm px-2 py-0.5 border border-[#E07A5F]/15">Q1</span>
            <div className="space-y-1">
              <label className="font-serif text-lg md:text-xl font-medium text-brand-text block">
                What is a book you absolutely loved?
              </label>
            </div>
          </div>
          <div className="pl-11 space-y-3">
            {lovedBooks.map((book, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 border-b border-brand-accent/30 focus-within:border-brand-accent pb-2"
              >
                <BookOpen className="text-brand-accent w-4.5 h-4.5 shrink-0" />
                <input
                  type="text"
                  placeholder={index === 0 ? "Atomic Habits, To Kill a Mockingbird, etc." : `Loved book #${index + 1}...`}
                  value={book}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLovedBooks((prev) => {
                      const next = [...prev];
                      next[index] = val;
                      return next;
                    });
                  }}
                  className="flex-grow bg-transparent border-none outline-none text-base md:text-lg font-serif text-brand-text placeholder-brand-muted/40"
                />
                
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setLovedBooks((prev) => prev.filter((_, idx) => idx !== index))}
                    className="p-1 px-2.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-brand-muted/80 border border-transparent rounded-md transition-all text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Remove book field"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                )}

                {index === lovedBooks.length - 1 && lovedBooks.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setLovedBooks((prev) => [...prev, ""])}
                    className="p-1 px-2.5 bg-[#365947]/5 hover:bg-[#365947]/10 text-[#365947] hover:text-[#2E4C3D] border border-[#365947]/20 rounded-md transition-all text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Add another book field"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* QUESTION 2 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="font-mono text-sm font-bold text-[#E07A5F] bg-[#E07A5F]/5 rounded-sm px-2 py-0.5 border border-[#E07A5F]/15">Q2</span>
            <div className="space-y-1">
              <label className="font-serif text-lg md:text-xl font-medium text-brand-text block">
                A book you didn't enjoy?
              </label>
            </div>
          </div>
          <div className="pl-11 space-y-3">
            {hatedBooks.map((book, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 border-b border-brand-accent/30 focus-within:border-brand-accent pb-2"
              >
                <BookMinus className="text-brand-accent w-4.5 h-4.5 shrink-0" />
                <input
                  type="text"
                  placeholder={index === 0 ? "Rich Dad Poor Dad, Twilight, etc." : `Didn't enjoy book #${index + 1}...`}
                  value={book}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHatedBooks((prev) => {
                      const next = [...prev];
                      next[index] = val;
                      return next;
                    });
                  }}
                  className="flex-grow bg-transparent border-none outline-none text-base md:text-lg font-serif text-brand-text placeholder-brand-muted/40"
                />

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setHatedBooks((prev) => prev.filter((_, idx) => idx !== index))}
                    className="p-1 px-2.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-brand-muted/80 border border-transparent rounded-md transition-all text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Remove book field"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                )}

                {index === hatedBooks.length - 1 && hatedBooks.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setHatedBooks((prev) => [...prev, ""])}
                    className="p-1 px-2.5 bg-[#365947]/5 hover:bg-[#365947]/10 text-[#365947] hover:text-[#2E4C3D] border border-[#365947]/20 rounded-md transition-all text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Add another book field"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* QUESTION 3 */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="font-mono text-sm font-bold text-[#E07A5F] bg-[#E07A5F]/5 rounded-sm px-2 py-0.5 border border-[#E07A5F]/15">Q3</span>
            <div className="space-y-1">
              <span className="font-serif text-lg md:text-xl font-medium text-brand-text block">
                Select your favourite genre.
              </span>
              <p className="font-sans text-xs text-brand-muted font-light">
                Select your genre landscape.
              </p>
            </div>
          </div>
          
          <div className="pl-11">
            {/* Toggle Chips */}
            <div className="flex flex-wrap gap-3">
              {[
                "Fiction",
                "Fantasy",
                "Science Fiction",
                "Mystery",
                "Thriller",
                "Crime",
                "Horror",
                "Romance",
                "Historical Fiction",
                "Literary Fiction",
                "Adventure",
                "Humor",
                "Poetry",
                "Graphic Novels & Manga",
                "Biography & Memoir",
                "History",
                "Science",
                "Technology",
                "Psychology",
                "Philosophy",
                "Self-Help",
                "Business",
                "Politics",
                "Religion & Spirituality",
                "Health & Wellness"
              ].map((pref) => {
                const selectedGenres = formData.genrePreference ? formData.genrePreference.split(", ") : [];
                const isSelected = selectedGenres.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => {
                      let nextGenres: string[];
                      if (isSelected) {
                        nextGenres = selectedGenres.filter(g => g !== pref);
                      } else {
                        nextGenres = [...selectedGenres, pref];
                      }
                      setFormData((p) => ({ ...p, genrePreference: nextGenres.join(", ") }));
                    }}
                    className={`px-5 py-3 rounded-full text-sm font-serif border cursor-pointer transition-all duration-300 flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-[#365947] text-white border-[#365947] shadow-sm font-medium"
                        : "bg-white text-brand-muted border-brand-border hover:border-brand-accent/50"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs text-[9px] ${isSelected ? "border-white bg-[#365947] text-white" : "border-brand-muted bg-white text-transparent"}`}>
                      {isSelected ? "✓" : ""}
                    </div>
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* QUESTION 4 */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="font-mono text-sm font-bold text-[#E07A5F] bg-[#E07A5F]/5 rounded-sm px-2 py-0.5 border border-[#E07A5F]/15">Q4</span>
            <div className="space-y-1">
              <span className="font-serif text-lg md:text-xl font-medium text-brand-text block">
                What do you enjoy more?
              </span>
              <p className="font-sans text-xs text-brand-muted font-light">
                Specify your ideal reading velocity and processing depth.
              </p>
            </div>
          </div>

          <div className="pl-11">
            {/* Radio selections styled beautifully */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([ "Fast-paced", "Deep and thoughtful" ] as const).map((style) => {
                const matches = 
                  (style === "Fast-paced" && formData.readingStyle === "Fast and engaging") ||
                  (style === "Deep and thoughtful" && formData.readingStyle === "Deep and thoughtful");
                
                const valToSet = style === "Fast-paced" ? "Fast and engaging" : "Deep and thoughtful";
                
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, readingStyle: valToSet }))}
                    className={`p-4 rounded-xl text-left border cursor-pointer transition-all duration-300 flex items-start gap-3.5 ${
                      matches
                        ? "bg-[#365947]/5 border-[#365947] text-brand-text shadow-xs"
                        : "bg-white border-brand-border hover:border-brand-accent/40 text-brand-muted"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${matches ? "border-[#365947]" : "border-brand-border"}`}>
                      {matches && <div className="w-2.5 h-2.5 rounded-full bg-[#365947]" />}
                    </div>
                    <div>
                      <span className="font-serif text-sm font-medium text-brand-text block">{style}</span>
                      <span className="text-[11px] text-brand-muted font-light leading-snug block mt-1">
                        {style === "Fast-paced" 
                          ? "Swift movements, prompt lessons, dynamic story arcs." 
                          : "Slow contemplative paragraphs, detailed frameworks, complex insights."}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* QUESTION 5 */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="font-mono text-sm font-bold text-[#E07A5F] bg-[#E07A5F]/5 rounded-sm px-2 py-0.5 border border-[#E07A5F]/15">Q5</span>
            <div className="space-y-1">
              <span className="font-serif text-lg md:text-xl font-medium text-brand-text block">
                why do you read books:
              </span>
              <p className="font-sans text-xs text-brand-muted font-light">
                Select your core reading motivations.
              </p>
            </div>
          </div>

          <div className="pl-11">
            <div className="flex flex-wrap gap-3">
              {[
                "Entertainment",
                "Learning",
                "Growth",
                "Inspiration",
                "Relaxation",
                "Escape",
                "Curiosity",
                "Connection",
                "Career",
                "Perspective"
              ].map((goalOption) => {
                const selectedGoals = formData.goal ? formData.goal.split(", ") : [];
                const isSelected = selectedGoals.includes(goalOption);
                return (
                  <button
                    key={goalOption}
                    type="button"
                    onClick={() => {
                      let nextGoals: string[];
                      if (isSelected) {
                        nextGoals = selectedGoals.filter(g => g !== goalOption);
                      } else {
                        nextGoals = [...selectedGoals, goalOption];
                      }
                      setFormData((p) => ({ ...p, goal: nextGoals.join(", ") }));
                    }}
                    className={`px-5 py-3 rounded-full text-sm font-serif border cursor-pointer transition-all duration-300 flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-[#365947] text-white border-[#365947] shadow-sm font-medium"
                        : "bg-white text-brand-muted border-brand-border hover:border-brand-accent/50"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs text-[9px] ${isSelected ? "border-white bg-[#365947] text-white" : "border-brand-muted bg-white text-transparent"}`}>
                      {isSelected ? "✓" : ""}
                    </div>
                    {goalOption}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* QUESTION 6 */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="font-mono text-sm font-bold text-[#E07A5F] bg-[#E07A5F]/5 rounded-sm px-2 py-0.5 border border-[#E07A5F]/15">Q6</span>
            <div className="space-y-1">
              <span className="font-serif text-lg md:text-xl font-medium text-brand-text block">
                How would you define yourself?
              </span>
              <p className="font-sans text-xs text-brand-muted font-light">
                Select the single trait that matches you best.
              </p>
            </div>
          </div>

          <div className="pl-11">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                "Kind",
                "Friendly",
                "Funny",
                "Confident",
                "Creative",
                "Ambitious",
                "Curious",
                "Thoughtful",
                "Adventurous",
                "Easygoing"
              ].map((option) => {
                const matches = formData.selfDefinition === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, selfDefinition: option }))}
                    className={`p-3.5 rounded-xl text-left border cursor-pointer transition-all duration-300 flex items-center gap-2.5 ${
                      matches
                        ? "bg-[#365947]/5 border-[#365947] text-brand-text shadow-xs"
                        : "bg-white border-brand-border hover:border-brand-accent/40 text-brand-muted"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${matches ? "border-[#365947]" : "border-brand-border"}`}>
                      {matches && <div className="w-1.5 h-1.5 rounded-full bg-[#365947]" />}
                    </div>
                    <span className="font-serif text-sm font-medium text-brand-text break-words leading-tight">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Primary submit action */}
      <div className="border-t border-brand-border/40 mt-12 pt-8 flex items-center justify-between">
        <span className="text-xs text-brand-muted font-mono uppercase tracking-wider">
          {isFormFullyValid ? "✓ ALL QUESTIONS COMPLETED" : "☒ PLEASE FILL REQUIRED FIELDS"}
        </span>

        <button
          id="generate-dna-btn"
          disabled={!isFormFullyValid}
          onClick={handleFormSubmit}
          className={`px-8 py-4 font-serif text-sm rounded-full flex items-center gap-2 border transition-all cursor-pointer ${
            isFormFullyValid
              ? "bg-[#E07A5F] border-[#E07A5F] text-white hover:bg-[#D0694D] shadow-md hover:shadow-lg active:scale-98"
              : "bg-brand-border/40 text-brand-muted/40 border-transparent cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-4.5 h-4.5" />
          Generate My Reading DNA
        </button>
      </div>
    </div>
  );
}
