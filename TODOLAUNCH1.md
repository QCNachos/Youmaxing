# Launch Operational Checklist

## Tasks YOU Need to Do (Outside Code)

### 1. Stripe Account Setup
- [ ] Create Stripe account at https://stripe.com
- [ ] Complete business verification (name, address, tax info)
- [ ] Create 3 subscription products:
  - **Basic Plan**: $9.99/month (basic AI model)
  - **Intermediate Plan**: $29.99/month (advanced AI model)
  - **Pro Plan**: $99.99/month (premium AI + all features)
- [ ] Configure billing portal settings (allow customers to cancel/update)
- [ ] Set up webhook endpoint (will provide URL after deployment)
- [ ] Get API keys: Secret Key, Publishable Key, Webhook Secret
- [ ] Enable test mode for initial testing

### 2. Domain & Email
- [ ] Purchase domain (optional but recommended): youmaxing.com or youmaxing.app
- [ ] Set up professional email: support@youmaxing.com
- [ ] Configure email forwarding or create Google Workspace

### 3. API Keys & Services
- [ ] OpenAI API key (for Basic/Intermediate/Pro tiers): https://platform.openai.com
- [ ] Anthropic API key (for Pro tier): https://console.anthropic.com
- [ ] TMDB API key (for Films feature): https://www.themoviedb.org/settings/api
- [ ] Sentry account (error tracking): https://sentry.io
- [ ] Upstash Redis (rate limiting): https://upstash.com

### 4. Legal Review
- [ ] Review generated Terms of Service
- [ ] Review generated Privacy Policy
- [ ] Review generated Refund Policy
- [ ] Consider consulting a lawyer (optional but recommended)
- [ ] Decide on refund policy details (7-day? 14-day? 30-day?)

### 5. Marketing Preparation
- [ ] Create Twitter/X account for product
- [ ] Create LinkedIn company page
- [ ] Prepare ProductHunt launch (draft description, screenshots)
- [ ] Write launch announcement post
- [ ] Prepare email template for early beta users
- [ ] Create 3-5 demo screenshots/videos

### 6. Banking & Accounting
- [ ] Set up business bank account (if separate from personal)
- [ ] Decide on accounting software (QuickBooks, Wave, etc.)
- [ ] Understand tax implications of SaaS revenue in your region
- [ ] Set up invoice tracking for Stripe payments

### 7. Customer Support
- [ ] Decide on support channel (email, Intercom, Discord?)
- [ ] Create support email auto-responder
- [ ] Write 5-10 FAQ answers for common questions
- [ ] Set support hours expectations

### 8. Launch Strategy
- [ ] Choose launch date (after testing completed)
- [ ] Decide on beta testing group (friends, Twitter followers?)
- [ ] Plan soft launch (beta) vs hard launch (public)
- [ ] Prepare pricing justification messaging
- [ ] Create demo video or GIF for social media

### 9. Monitoring & Analytics
- [ ] Create Vercel account dashboard access
- [ ] Set up Supabase monitoring alerts
- [ ] Configure Stripe email notifications for failed payments
- [ ] Set up Google Analytics (optional)

### 10. Post-Launch
- [ ] Monitor first 24 hours closely for errors
- [ ] Respond to early user feedback
- [ ] Post launch announcement on social media
- [ ] Submit to ProductHunt (if ready)
- [ ] Send email to any beta users/waitlist

---

## Important Decisions to Make

1. **Refund Policy**: How generous? (Recommend: 7-day money-back, no questions asked)
2. **Trial Period**: Offer free trial? (Recommend: 7-day trial for paid plans)
3. **Student Discount**: Offer discount for students? (Recommend: 50% off with verification)
4. **Annual Pricing**: Offer yearly plans at discount? (Recommend: 2 months free = $99/yr, $299/yr, $999/yr)
5. **BYOK Messaging**: How to explain "Bring Your Own Key" benefit clearly?

---

## Contacts You May Need

- **Lawyer**: For ToS/Privacy review (optional, ~$500-2000)
- **Accountant**: For tax setup (optional, ~$200-500)
- **Designer**: For marketing materials if needed (optional, Fiverr/99designs)
- **Beta Testers**: 10-20 people willing to test for free

---

## Budget Estimate

- Domain: $10-15/year
- Stripe fees: 2.9% + $0.30 per transaction
- Vercel Pro (if needed): $20/month
- Supabase Pro (if needed): $25/month
- OpenAI API: ~$0.002 per AI message (estimate $100-500/month initially)
- Anthropic API: ~$0.01 per AI message for Claude
- Sentry: Free tier sufficient initially
- Email service: $0-15/month
- **Total monthly**: ~$200-600 depending on usage

---

## Timeline Suggestion

**Week 1**: Get Stripe + API keys + domain
**Week 2**: Code implementation (developer handles)
**Week 3**: Testing + Legal review + Marketing prep
**Launch Day**: Soft launch to beta group
**Launch +3 days**: Public launch + ProductHunt

