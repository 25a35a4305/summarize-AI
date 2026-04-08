/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowRight,
  Info,
  History,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { summarizeTextStream } from "@/src/lib/gemini";

type SummaryLength = 'short' | 'medium' | 'long';

interface HistoryItem {
  id: string;
  original: string;
  summary: string;
  timestamp: number;
  length: SummaryLength;
}

export default function App() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [length, setLength] = useState<SummaryLength>('medium');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSummarize = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setSummary("");
    let fullSummary = "";
    try {
      const stream = summarizeTextStream(input, length);
      for await (const chunk of stream) {
        fullSummary += chunk;
        setSummary(fullSummary);
      }
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        original: input,
        summary: fullSummary,
        timestamp: Date.now(),
        length
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (error) {
      console.error(error);
      setSummary("Error: Failed to generate summary. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput("");
    setSummary("");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setInput(item.original);
    setSummary(item.summary);
    setLength(item.length);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-primary/10 selection:text-primary">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Summarize AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)}
              className="text-muted-foreground hover:text-foreground"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Input Text
                </h2>
                <div className="flex gap-1 bg-muted p-1 rounded-md">
                  {(['short', 'medium', 'long'] as SummaryLength[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                        length === l 
                          ? "bg-white text-primary shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <Card className="border-none shadow-sm overflow-hidden ring-1 ring-border/50 focus-within:ring-primary/50 transition-all">
                <Textarea
                  placeholder="Paste your long text here (articles, essays, notes...)"
                  className="min-h-[400px] border-none focus-visible:ring-0 resize-none p-6 text-base leading-relaxed"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <CardFooter className="bg-muted/30 px-6 py-3 flex justify-between items-center border-t border-border/40">
                  <span className="text-xs text-muted-foreground">
                    {input.length} characters
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleReset}
                      disabled={!input}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSummarize}
                      disabled={!input || isLoading}
                      className="shadow-sm"
                    >
                      {isLoading ? "Summarizing..." : "Summarize"}
                      {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Summary
              </h2>

              <Card className="border-none shadow-sm ring-1 ring-border/50 min-h-[400px] flex flex-col">
                <CardContent className="p-6 flex-grow">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[95%]" />
                        <Skeleton className="h-4 w-[85%]" />
                        <Skeleton className="h-4 w-[40%]" />
                      </motion.div>
                    ) : summary ? (
                      <motion.div
                        key="summary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-sm max-w-none"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary" className="font-normal">
                            {length.charAt(0).toUpperCase() + length.slice(1)} Length
                          </Badge>
                        </div>
                        <p className="text-[#333] leading-relaxed whitespace-pre-wrap">
                          {summary}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
                      >
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <Info className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">No summary yet</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Enter text on the left and click Summarize
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
                {summary && !isLoading && (
                  <CardFooter className="bg-muted/30 px-6 py-3 border-t border-border/40">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full bg-white hover:bg-white/80"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Summary
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Summaries
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                    <History className="w-12 h-12 opacity-20 mb-4" />
                    <p className="text-sm">No history yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {item.length}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {item.original}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        {item.summary}
                      </p>
                    </button>
                  ))
                )}
              </div>
              {history.length > 0 && (
                <div className="p-6 border-t border-border">
                  <Button variant="outline" className="w-full" onClick={clearHistory}>
                    Clear History
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="max-w-5xl mx-auto px-6 py-12 text-center text-muted-foreground">
        <Separator className="mb-8 opacity-50" />
        <p className="text-xs">
          Powered by Google Gemini AI • Built with React & Tailwind
        </p>
      </footer>
    </div>
  );
}

