import { useState } from "react";
import { Database, CheckCircle2, XCircle, Copy, Check, Terminal, ExternalLink, RefreshCw, AlertTriangle, PlayCircle } from "lucide-react";
import { isSupabaseConfigured, getSupabase } from "../lib/supabase";
import { SUPABASE_SQL_SCHEMA } from "../lib/supabaseSync";

interface SupabaseConnectionCardProps {
  userId?: string;
  onRefresh?: () => void;
}

export default function SupabaseConnectionCard({ userId, onRefresh }: SupabaseConnectionCardProps) {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  
  // Interactive test status
  const [testState, setTestState] = useState<"idle" | "loading" | "success" | "warning" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runConnectionDiagnostic = async () => {
    if (!isSupabaseConfigured) {
      setTestState("error");
      setTestMessage("Missing configuration secrets. Please record VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your AI Studio secrets panel first.");
      return;
    }

    setTestState("loading");
    setTestMessage("Initiating network handshake with Supabase server...");

    try {
      const supabase = getSupabase();
      
      // Let's check connection and key auth by querying the bookshelf table
      const { data, error } = await supabase
        .from("bookshelf")
        .select("id")
        .limit(1);

      if (error) {
        // Code '42P01' is 'relation does not exist' in PostgreSQL
        if (error.code === "42P01" || error.message?.toLowerCase().includes("relation") || error.message?.toLowerCase().includes("does not exist")) {
          setTestState("warning");
          setTestMessage("Supabase credentials are valid! However, the 'bookshelf' table setup was not found. Please click 'Show SQL' below and run the script in your Supabase SQL Editor.");
        } else {
          setTestState("error");
          setTestMessage(`Supabase authenticated but returned an error: [${error.code || "REST_ERROR"}] ${error.message}`);
        }
      } else {
        // Successful select! Let's check reading_profiles too
        const profileCheck = await supabase.from("reading_profiles").select("user_id").limit(1);
        if (profileCheck.error) {
          setTestState("warning");
          setTestMessage("Connected! Bookshelf table verified, but the 'reading_profiles' table is missing. Execute the SQL setup script below.");
        } else {
          setTestState("success");
          setTestMessage("Connection successful! Authenticated safely, verified tables are initialized and responsive to write-triggers.");
        }
      }
    } catch (err: any) {
      console.error("Supabase connection diagnostic crash:", err);
      setTestState("error");
      setTestMessage(err?.message || "Connection refused. Please audit the endpoint prefix and ensure your project isn't paused.");
    }
  };

  const hasCredentials = isSupabaseConfigured;

  return (
    <div className="bg-[#FAF6F0] border border-[#E8E2D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl mx-auto" id="supabase-connection-panel">
      {/* Header section with Database Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#365947]/10 flex items-center justify-center text-[#365947]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1E1E1B]">Supabase DB Integration</h3>
            <p className="text-xs font-sans text-brand-muted">PostgreSQL Cloud Database Replication</p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2">
          {hasCredentials ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#365947]/10 text-[#365947] border border-[#365947]/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected (Keys Set)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <XCircle className="w-3.5 h-3.5" />
              Secrets Not Detected
            </span>
          )}
          {onRefresh && (
            <button
              onClick={() => {
                if (onRefresh) onRefresh();
                setTestState("idle");
                setTestMessage("");
              }}
              className="p-1 px-2 border border-[#E8E2D8] hover:border-[#365947]/50 rounded-md transition-colors text-brand-muted hover:text-[#365947]"
              title="Re-evaluate Connection"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
            </button>
          )}
        </div>
      </div>

      {hasCredentials ? (
        <div className="space-y-4">
          <div className="p-4 bg-[#365947]/5 border border-[#365947]/15 rounded-xl space-y-2">
            <h4 className="font-serif font-medium text-sm text-[#1E1E1B] flex items-center gap-2">
              <CheckCircle2 className="text-[#365947] w-4 h-4 shrink-0" />
              Dual-Database Replication Mode Active
            </h4>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-light">
              Bookmarkd mirrors all your user activity and bookmarked library rows directly to your private Supabase backend. Perfect for external visualizers, integrations, and independent exports!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-[#E8E2D8] rounded-xl shadow-2xs">
            <div className="space-y-1">
              <span className="text-xs font-sans font-semibold text-brand-text">Verify Database Credentials</span>
              <p className="text-[11px] text-brand-muted font-sans font-light">Run an instant end-to-end telemetry check with the Supabase API.</p>
            </div>
            
            <button
              onClick={runConnectionDiagnostic}
              disabled={testState === "loading"}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium border cursor-pointer transition-all duration-300 ${
                testState === "loading"
                  ? "bg-slate-100 text-slate-400 border-slate-200"
                  : "bg-[#365947] hover:bg-[#284234] text-white border-[#365947]"
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 animate-pulse" />
              {testState === "loading" ? "Querying..." : "Test Connectivity"}
            </button>
          </div>

          {/* Test Diagnostic Output Panel */}
          {testState !== "idle" && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 font-sans transition-all duration-300 ${
              testState === "loading" ? "bg-slate-50 border-slate-200 text-slate-600" : ""
            } ${
              testState === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : ""
            } ${
              testState === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" : ""
            } ${
              testState === "error" ? "bg-rose-50 border-rose-150 text-rose-800" : ""
            }`}>
              <div className="font-mono text-[10px] font-bold tracking-wider uppercase mb-1 flex items-center gap-1.5">
                {testState === "loading" && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
                {testState === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {testState === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {testState === "error" && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                TEST LOG RESULT: {testState}
              </div>
              <p className="font-light">{testMessage}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-brand-muted">
            <span className="bg-white border border-[#E8E2D8] px-2.5 py-1 rounded-md">
              ENDPOINT: {import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL.substring(0, 30)}...` : "N/A"}
            </span>
            <span className="bg-white border border-[#E8E2D8] px-2.5 py-1 rounded-md">
              ROLE: authenticated_client
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/55 border border-amber-200/50 rounded-xl space-y-2">
            <h4 className="font-serif font-medium text-sm text-brand-text">How to connect your Supabase database:</h4>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-light animate-pulse">
              Bookmarkd has native dual-write replication ready. To connect yours, satisfy these parameters in your **AI Studio Settings / Secrets Panel** or local `.env` variables:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-mono text-brand-muted leading-loose">
              <li><strong className="text-[#1E1E1B]">VITE_SUPABASE_URL</strong> - Your project's API endpoint URL.</li>
              <li><strong className="text-[#1E1E1B]">VITE_SUPABASE_ANON_KEY</strong> - Your project's public anon client key.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SQL Script Accordion section */}
      <div className="border border-[#E8E2D8] bg-white rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => setShowSql(!showSql)}
          className="w-full flex items-center justify-between p-4 bg-[#FAF6F0]/50 hover:bg-[#FAF6F0] border-b border-[#E8E2D8] transition-colors cursor-pointer"
        >
          <span className="font-serif text-xs font-semibold text-[#1E1E1B] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#365947]" />
            Show SQL Initialization Commands (Supabase SQL Editor)
          </span>
          <span className="font-mono text-[10px] text-[#365947] hover:underline font-bold">
            {showSql ? "Collapse" : "Expand"}
          </span>
        </button>

        {showSql && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-brand-muted font-sans font-light">
                Copy and execute this script inside your Supabase SQL editor to create the replication tables:
              </p>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E2D8] hover:border-[#365947] hover:bg-[#365947]/5 rounded-md text-[10px] font-sans font-medium text-brand-text transition-all bg-white cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#365947]" />}
                {copied ? "Copied SQL!" : "Copy SQL"}
              </button>
            </div>

            <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-md text-[10px] font-mono overflow-x-auto leading-relaxed max-h-56">
              {SUPABASE_SQL_SCHEMA}
            </pre>

            <div className="flex items-center gap-1.5 text-[10px] font-sans text-brand-muted pt-1">
              <span>SQL Editor Link:</span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-[#365947] hover:underline font-medium"
              >
                Supabase Dashboard
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
