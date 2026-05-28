# Product Hunt Launch Checklist — Use AI Writer

## Pre-Launch (7 Days Out)
- [ ] Finalize Product Hunt page: tagline, description, screenshots, GIF, video
- [ ] Create Maker account and complete profile
- [ ] Identify friends/community members who will upvote and comment on launch day
- [ ] Prepare Maker Comment (first comment after launch)
- [ ] Prepare reply templates for common comment types
- [ ] Schedule social media posts announcing Product Hunt launch
- [ ] Prepare email blast to waitlist subscribers

## Pre-Launch (3 Days Out)
- [ ] Draft social media teaser posts
- [ ] Reach out to a few Product Hunt Makers for pre-launch feedback
- [ ] Test all links and downloads in Product Hunt listing
- [ ] Prepare 5+ pre-written comments for launch day
- [ ] Confirm launch time (typically 12:01 AM PST for maximum visibility)

## Pre-Launch (1 Day Out)
- [ ] Double-check all Product Hunt assets
- [ ] Confirm with community members they'll participate on launch day
- [ ] Set calendar reminders for key times during launch day
- [ ] Prepare thank-you DM templates for anyone who helps promote

## Pre-Launch (24 Hours) — Final Check
- [ ] **Website availability**: Verify tryaiwriter.com loads globally (check via pingdom or uptimerobot)
- [ ] **Pricing page**: Confirm all tiers display correctly, payment links work, Stripe/PayPal integration is live
- [ ] **Login/Signup flow**: Test full auth flow — email signup, Google OAuth, password reset, session persistence
- [ ] **Writing page**: Test generate, stream, copy, download, clear — all core functions must work flawlessly
- [ ] **Payment system**: Run a test checkout for each plan, verify webhook delivery, confirm redirect URLs
- [ ] **Database health**: Check connection pool, verify recent backups exist, monitor query performance
- [ ] **Error monitoring**: Confirm Sentry/Vercel Analytics is active, test error tracking with a deliberate 500
- [ ] **Rate limiting**: Verify API rate limits are in place to prevent abuse during traffic spike
- [ ] **CDN caching**: Confirm static assets are properly cached, invalidate any stale CDN entries
- [ ] **Mobile responsive**: Test on iOS Safari, Chrome Android — writing page is primary entry point
- [ ] **Analytics tracking**: Verify pageview events, conversion funnel tracking, and goal completion are firing
- [ ] **Email deliverability**: Test welcome emails, password reset emails — check spam folder placement
- [ ] **Social cards**: Verify Open Graph images render correctly when sharing links on Twitter, LinkedIn, Facebook
- [ ] **SSL certificates**: Confirm HTTPS is active on all subdomains, no mixed content warnings

## Launch Day!
- [ ] Submit product at 12:01 AM PST
- [ ] Immediately post Maker Comment
- [ ] Monitor comments and reply within 30 minutes
- [ ] Post updates in Discord/community channels every few hours
- [ ] Share Product Hunt link in LinkedIn/Twitter/X
- [ ] Reply to every single comment
- [ ] Track upvotes and rank throughout the day

## Post-Launch Follow-Up Strategy

### 1 Hour After Launch
- [ ] Check rank position (goal: top 5 within first hour)
- [ ] Reply to ALL comments that came in during first hour
- [ ] Share launch link in 3-5 key communities (Indie Hackers, r/SaaS, relevant Discord servers)
- [ ] Send internal team update: initial stats (upvotes, comments, visitors)
- [ ] Monitor server load and response times — be ready to scale if needed
- [ ] If rank is below #5, activate backup promotion channels (Twitter threads, LinkedIn posts)

### 3 Hours After Launch
- [ ] Post a progress update on Twitter/X with screenshot of Product Hunt rank
- [ ] Engage with every new comment within 15 minutes
- [ ] Share launch in relevant Slack communities and newsletters
- [ ] Check for any negative feedback and respond constructively
- [ ] Monitor signup conversion rate — if low, check if there's a UX issue on the landing page
- [ ] If trending toward #1, prepare celebration content for social media

### 6 Hours After Launch
- [ ] Post midday update: "We're #X on Product Hunt! Thank you everyone!" with link
- [ ] Reach out personally to top supporters who have been actively upvoting/commenting
- [ ] Share key metrics publicly (signups, users, positive comments) — transparency builds trust
- [ ] Monitor for any Product Hunt policy issues or flags
- [ ] Prepare end-of-day summary to post in comments
- [ ] Check if Hacker News / Reddit / Twitter mentions are growing — engage where activity is highest

### 24 Hours
- [ ] Thank everyone who upvoted/commented
- [ ] Send follow-up DMs to key supporters
- [ ] Post update in Product Hunt comments about launch results
- [ ] Send wrap-up email to waitlist
- [ ] Update product page with any feedback received

### 48 Hours
- [ ] Analyze traffic and signups from Product Hunt
- [ ] Share results in Maker communities
- [ ] Prepare blog post about launch learnings

### 7 Days
- [ ] Follow up with new users
- [ ] Collect testimonials for future launches
- [ ] Document lessons learned for next time

---

## Maker Comment — Final Version (200-300 words)

Hey PH community! 👋

I'm the maker of **Use AI Writer** — an AI writing assistant that learns your brand voice so every piece of content sounds like *you*, not a generic chatbot.

**Why we built this:** Most AI writing tools produce content that sounds the same. We believe your brand deserves a unique voice. So we built a **Digital Twin** that analyzes your existing content — blog posts, emails, social media — and writes new content in *your* style, not someone else's.

**What makes us different:**
- 🧠 **Brand Voice Learning**: Upload 3+ samples of your writing, and our AI learns your tone, vocabulary patterns, and sentence structure
- 🤖 **Dual AI Models**: Switch between DeepSeek V3 (fast, $5/mo) and Claude Sonnet 4.6 (premium quality) — you control the trade-off
- 💬 **Creative Interview Engine**: When you have a vague idea, our AI asks clarifying questions to transform it into structured, publish-ready content
- 📊 **Style Match Scoring**: Real-time feedback on how closely generated content matches your brand voice
- 💾 **Memory Bank**: Your AI remembers your preferences across sessions — it gets smarter every time you use it

**Pricing that actually makes sense:** Free tier for testing, Pro at $5/mo, Max at $15/mo. No enterprise pricing, no hidden fees.

Try it free at [tryaiwriter.com](https://tryaiwriter.com) — no credit card required. I'll be here all day answering questions and reading your feedback. What would you want from an AI writing tool?

---

## Comment Reply Templates

### 1. "Looks great, I'll try it!"
Thanks so much! 🎉 Would love to hear your feedback after trying it out. Let us know what you think!

### 2. "How is this different from [Competitor X]?"
Great question! Unlike [Competitor], we focus on:
- Brand voice learning that actually works (upload your content, AI learns YOUR style)
- Dual AI models — pick DeepSeek for speed/price or Claude for quality
- No credit card required to try
- $5/mo Pro plan (vs. $39-49/mo for competitors)

Give it a shot and let us know what you think!

### 3. "Can you share more about tech stack?"
Definitely! We're using:
- Next.js 16 + TypeScript for the frontend
- Tailwind CSS for styling
- NextAuth.js for authentication
- Anthropic Claude + DeepSeek APIs for AI generation
- Server-side streaming for real-time content generation

### 4. "How do you handle privacy?"
Privacy is super important to us!
- We don't train on user content — your writing stays yours
- All data is encrypted in transit and at rest
- You can delete your account and all data at any time
- API keys and prompts are never logged or stored

### 5. "This looks amazing! Congrats!"
Thank you so much! Means a lot coming from you. We put a lot of work into this and it's great to see it launched! Try it out and let me know if you have any feedback — I'm always looking to improve.

### 6. "Is there an API available?"
We're currently focused on the web app experience, but an API is on our roadmap! If you're interested in API access, drop your email at tryaiwriter.com and we'll notify you when it's available.

### 7. "What languages does it support?"
Use AI Writer supports 50+ languages through our DeepSeek and Claude models. The brand voice learning works best in English currently, but we're actively expanding multi-language support. Try it in your language and let us know how it works!
