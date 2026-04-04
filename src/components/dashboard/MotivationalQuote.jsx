import React from "react";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const quotes = [
  { text: "The body achieves what the mind believes.", author: "Muhammad Zaidi" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "Success isn't given. It's earned. On the track, on the field, in the gym. With blood, sweat, and the occasional tear.", author: "Nike" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" }
];

export default function MotivationalQuote() {
  const [quote] = React.useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
      <div className="p-6 flex gap-4">
        <Quote className="w-8 h-8 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-lg font-medium text-gray-800 mb-2">"{quote.text}"</p>
          <p className="text-sm text-gray-600">— {quote.author}</p>
        </div>
      </div>
    </Card>
  );
}