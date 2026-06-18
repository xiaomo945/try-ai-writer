"use client";

import { ScrollReveal } from "./ScrollReveal";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Finally, an AI that understands my brand voice. Saves me 10+ hours weekly.",
    name: "Sarah",
    role: "Content Creator"
  },
  {
    id: 2,
    quote: "The creative interview engine is genius. Asks better questions than I do.",
    name: "Marcus",
    role: "Novelist"
  },
  {
    id: 3,
    quote: "Switched from Jasper. Half the price, twice the personalization.",
    name: "Alex",
    role: "Marketing Lead"
  },
  {
    id: 4,
    quote: "My digital twin writes exactly like me now. It's almost creepy.",
    name: "Jordan",
    role: "Blogger"
  },
  {
    id: 5,
    quote: "Best AI writing tool for non-native speakers. My English content has never been better.",
    name: "Yuki",
    role: "Entrepreneur"
  }
];

function StarRating() {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((star) => (
        <svg
          key={star}
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="#fbbf24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return null;
}
