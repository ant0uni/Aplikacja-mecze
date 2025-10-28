# 🚀 Production Deployment Checklist

Use this checklist before deploying your Football Predictions App to production.

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Create production Neon DB database
- [ ] Obtain production DATABASE_URL from Neon
- [ ] Generate strong JWT_SECRET (min 32 characters, use: https://generate-secret.vercel.app)
- [ ] Verify SportMonks API token and quota limits
- [ ] Set NEXT_PUBLIC_APP_URL to production domain

### Database
- [ ] Run migrations on production database: `npm run db:push`
- [ ] Verify all tables created correctly
- [ ] Test database connection from production
- [ ] Set up database backups (Neon handles this)
- [ ] Check database connection pooling settings

### Security
- [ ] Change JWT_SECRET to production value (never reuse dev secret)
- [ ] Verify all passwords are hashed with bcrypt
- [ ] Check httpOnly cookies are enabled
- [ ] Confirm security headers in next.config.ts
- [ ] Enable HTTPS/SSL on production domain
- [ ] Set secure cookie flag to true in production
- [ ] Review CORS settings if needed
- [ ] Implement rate limiting on API routes (optional but recommended)

### Code Review
- [ ] Remove all console.log statements (or use proper logging)
- [ ] Remove any hardcoded credentials
- [ ] Check all error messages don't expose sensitive info
- [ ] Verify input validation on all API routes
- [ ] Test all authentication flows
- [ ] Ensure proper error handling throughout

### Environment Variables (Production)
Set these in your hosting platform (Vercel/etc.):

```env
DATABASE_URL=postgresql://...  # Production Neon DB
SPORTMONKS_API_TOKEN=...       # Your API token
JWT_SECRET=...                 # Strong random string (32+ chars)
NEXT_PUBLIC_APP_URL=https://... # Your production domain
NODE_ENV=production            # Important!
```

### Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test user logout
- [ ] Test protected routes
- [ ] Test fixtures loading
- [ ] Test coin addition (temporary feature)
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Test API endpoints with Postman/Insomnia
- [ ] Load test authentication endpoints

### Performance
- [ ] Run `npm run build` and check for errors
- [ ] Verify bundle size is acceptable
- [ ] Test page load speeds
- [ ] Check Lighthouse scores
- [ ] Optimize images if any added
- [ ] Verify caching headers for API routes
- [ ] Check database query performance

### Monitoring & Logging
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure logging service
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors
- [ ] Set up analytics (Google Analytics, Plausible, etc.)

## 🔧 Vercel Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial production-ready commit"
git push origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project settings

### 3. Environment Variables
Add these in Vercel dashboard:
- `DATABASE_URL`
- `SPORTMONKS_API_TOKEN`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Test production deployment

### 5. Custom Domain (Optional)
- Add custom domain in Vercel settings
- Update DNS records
- Wait for SSL certificate provisioning
- Update `NEXT_PUBLIC_APP_URL` with new domain

## 🧪 Post-Deployment Testing

### Smoke Tests
- [ ] Homepage loads correctly
- [ ] Login works
- [ ] Registration works
- [ ] Dashboard displays user data
- [ ] Fixtures load from API
- [ ] Logout works
- [ ] Protected routes redirect properly

### Security Tests
- [ ] Try accessing protected routes without login
- [ ] Verify JWT tokens expire correctly
- [ ] Check cookies are httpOnly and secure
- [ ] Test SQL injection attempts (should be blocked)
- [ ] Test XSS attempts (should be blocked)
- [ ] Verify HTTPS is enforced

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Mobile performance acceptable

## 📊 Monitoring Setup

### Recommended Tools
- **Error Tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Plausible
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Vercel Analytics, New Relic
- **Logs**: Logtail, Papertrail

## 🔐 Security Hardening

### Additional Security Measures
- [ ] Set up rate limiting with `express-rate-limit` or similar
- [ ] Implement CSRF protection for state-changing operations
- [ ] Add captcha to registration (optional)
- [ ] Set up IP whitelisting for admin routes (if added)
- [ ] Enable Vercel's DDoS protection
- [ ] Regular security audits with `npm audit`
- [ ] Keep dependencies updated

### Security Headers Verification
Your app already has these configured in `next.config.ts`:
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Strict-Transport-Security
- ✅ Referrer-Policy
- ✅ Permissions-Policy

## 🔄 Maintenance Plan

### Weekly
- [ ] Check error logs
- [ ] Monitor API usage/quotas
- [ ] Review analytics

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Security audit: `npm audit`
- [ ] Review database performance
- [ ] Check backup integrity
- [ ] Review user feedback

### Quarterly
- [ ] Major dependency updates
- [ ] Security review
- [ ] Performance optimization
- [ ] Feature planning

## 📞 Emergency Contacts

Document these for your team:

- **Hosting**: Vercel support
- **Database**: Neon support
- **API Provider**: SportMonks support
- **DNS Provider**: [Your provider]
- **On-call Developer**: [Contact info]

## ✅ Final Pre-Launch Checklist

- [ ] All above items completed
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Team trained on deployment process
- [ ] Documentation updated
- [ ] Legal pages added (Terms, Privacy) if needed
- [ ] Contact/support page added
- [ ] Favicon and meta tags set
- [ ] Social media cards configured
- [ ] SEO optimized

## 🎉 Launch Day

1. ✅ Final production build test
2. ✅ Database migration verified
3. ✅ Environment variables confirmed
4. ✅ DNS propagation complete
5. ✅ SSL certificate active
6. ✅ Monitoring enabled
7. ✅ Team ready for support
8. 🚀 **LAUNCH!**

## 📈 Post-Launch

- Monitor for 24-48 hours actively
- Watch for error spikes
- Check user feedback
- Monitor API quotas
- Verify email functionality (when added)
- Celebrate! 🎊

---

**Good luck with your launch! 🚀⚽**
