# Hacker News Launch Preparation: Show HN Guide

## Show HN Post Template

**Title:** Show HN: Use AI Writer – Multi-Model AI Writing Tool with Brand Voice Learning

**Body:**
Hi HN,

After months of building and iterating with beta users, we're excited to share Use AI Writer – an AI writing tool that we think solves some real pain points for creators, marketers, and developers who write a lot.

### What makes Use AI Writer different?

1. **Multi-Model AI** – Most tools lock you into one model. We let you switch between DeepSeek (fast, great for drafts) and Claude Sonnet 4.6 (premium quality for important pieces) with a single click.

2. **Brand Voice Learning** – Generic AI writing makes everyone sound the same. We actually learn your unique writing style from your existing content so everything stays on-brand.

3. **Creative Interview Engine** – Instead of making you guess the perfect prompt, our AI interviews you to understand what you want, then builds the perfect prompt for you.

4. **Document Upload** – Train your brand voice by uploading your existing writing – articles, emails, social posts, whatever you have.

5. **It's Fast** – No waiting around. Get quality writing in seconds, not minutes.

### Why we built this?

As developers who also do content marketing, we got frustrated with AI tools that:
- Locked you into a single provider
- Made everything sound generic
- Required you to be a prompt engineer
- Were just slow

So we built what we wanted – a tool that actually amplifies our writing instead of replacing it.

We'd love to hear what you think! Check it out: https://tryaiwriter.com

(Also, we have a free tier so you can try it without putting in a credit card)

---

## First Comment (From Your Account)

Just wanted to add some technical details since HN loves that:

- Built with Next.js 15 and TypeScript
- AI orchestration via LangChain
- Multi-model support with automatic fallback if one model has issues
- Brand voice learning using embeddings + fine-tuned prompt templates
- Creative Interview Engine uses few-shot prompting to ask the right questions
- All user data encrypted at rest and in transit
- No data used for training without explicit consent

Would love to hear feedback from the community – especially around the brand voice learning and multi-model approach!

---

## Best Posting Time
- **Tuesday or Wednesday**, **10 AM Pacific Time** (1 PM Eastern, 6 PM GMT)
- This is when HN has the most active users from both US coasts and Europe
- Avoid weekends and holidays

---

## Key Technical Differentiation to Emphasize

Make sure to highlight these technical points in comments and follow-ups:

1. **Multi-Model Orchestration** – Not just switching models, but intelligent selection based on task type + automatic failover
2. **Brand Voice as Embeddings** – We don't just copy-paste your style; we use embeddings to understand the nuances of your writing
3. **Creative Interview as Few-Shot Prompting** – The interview questions are dynamically generated based on what you're trying to create
4. **No Training Data Lock-In** – Your content is yours; we never use it for training anything without explicit permission
5. **Built for Speed** – Optimized inference paths, cached embeddings, and efficient prompt engineering mean you get results in seconds

---

## FAQ & Comment Response Templates

### Q: How is this different from [Other AI Writing Tool]?
Great question! The main differences are:
- We support multiple models (DeepSeek + Claude) instead of locking you into one
- Our brand voice learning actually learns from your existing content rather than just applying a generic "tone" slider
- Our Creative Interview Engine helps you get better results without having to be a prompt engineer
- We're focused on speed – no waiting around

### Q: Do you train on my content?
No, we never train our models on your content without explicit permission. Your uploaded documents are used only for your brand voice learning (via embeddings, not fine-tuning) and are encrypted at rest. You can delete them at any time.

### Q: What's your pricing?
We have a free tier that lets you try everything with no credit card required. Our paid plans start at $5/month (yes, really – we wanted to make this accessible) and scale based on usage. Full details: https://tryaiwriter.com/pricing

### Q: What tech stack did you use?
Next.js 15, TypeScript, LangChain for AI orchestration, DeepSeek + Claude APIs, Tailwind CSS for styling, and PostgreSQL for data storage. All deployed on Vercel.

### Q: Can I use this for [specific use case]?
Probably! We built Use AI Writer to be flexible – it works great for blog posts, social media, emails, product descriptions, documentation, and more. The best way to know is to try it (it's free!) and see if it fits your workflow.

### Q: Do you have an API?
Not yet, but it's high on our roadmap. If that's something you're interested in, let us know – we'd love to talk about what you'd need.

---

## Engagement Strategy

1. **Be responsive** – Check HN frequently for the first 6 hours after posting. Respond to every comment, even if it's just a quick "thanks!"
2. **Ask questions back** – If someone gives feedback, ask follow-up questions to keep the conversation going
3. **Be humble** – Admit what's not perfect yet, and share your roadmap
4. **Don't spam** – Post only once, and don't keep promoting it in the comments
5. **Thank people** – Make sure to thank people for their feedback and suggestions

---

## Things to Watch For

- **Negative comments** – Don't get defensive. Thank them for their feedback, explain your thinking, and offer to improve
- **Technical questions** – Be detailed in your answers – HN loves technical depth
- **Feature requests** – Take note of them, and mention if they're already on your roadmap
- **Interest from potential users** – Invite them to try it, and ask for their specific use case

Good luck! The HN community can be tough but fair – focus on being helpful and transparent, and you'll do great.
