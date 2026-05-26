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
          className="w-5 h-5 text-amber-400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <ScrollReveal>
      <section className="w-full py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-2 text-center">
            Loved by Creators Worldwide
          </h2>
          <p className="text-center text-slate-500 mb-10 max-w-xl mx-auto">
            Join thousands of creators who are already scaling their content with AI
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="glass-card p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StarRating />
                <p className="mt-4 text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold"
                    style={{
                      background: `linear-gradient(135deg, hsl(${(index * 70) % 360}, 70%, 60%), hsl(${(index * 70 + 60) % 360}, 70%, 60%))`
                    }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
