"use client";

import { useState, useEffect } from 'react';
import { suggestReplies } from '@/ai/flows/suggest-replies';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface SmartReplySuggestionsProps {
  chatHistory: string;
  currentMessage: string;
  onSuggestionClick: (suggestion: string) => void;
}

export default function SmartReplySuggestions({ 
  chatHistory, 
  currentMessage, 
  onSuggestionClick 
}: SmartReplySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (currentMessage) {
      setLoading(true);
      suggestReplies({ chatHistory, currentMessage })
        .then(output => {
          setSuggestions(output.suggestions);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
        setSuggestions([]);
    }
  }, [currentMessage, chatHistory]);

  if (!loading && suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-2">
       <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
      {loading ? (
        <>
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
        </>
      ) : (
        suggestions.map((suggestion, index) => (
          <Button 
            key={index} 
            variant="outline" 
            size="sm"
            className="rounded-full whitespace-nowrap"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))
      )}
    </div>
  );
}
