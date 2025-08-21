# Deployment Guide - Word Search App

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   cd word-search-app
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `word-search-app` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings: `N`

5. **Your app will be deployed!** 🎉

### Option 2: Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Word Search App"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

## 🔧 Pre-deployment Checklist

- [ ] ✅ All tests pass (`node lib/test.js`)
- [ ] ✅ Build succeeds (`npm run build`)
- [ ] ✅ Development server works (`npm run dev`)
- [ ] ✅ API endpoints respond correctly
- [ ] ✅ Word dictionary file is included

## 📁 Files Included in Deployment

- `lib/wordSearch.js` - Core search engine
- `pages/api/search.js` - API endpoint
- `pages/index.js` - Main UI
- `words_dictionary_5.json` - Word dictionary
- `vercel.json` - Vercel configuration
- `package.json` - Dependencies
- `next.config.mjs` - Next.js configuration

## 🌐 Environment Variables

The app works without any environment variables, but you can add:

```bash
# In Vercel dashboard or .env.local
NODE_ENV=production
```

## 📊 Performance Monitoring

After deployment, monitor:
- **Function execution time** (should be < 30s)
- **Memory usage** (optimized for Vercel's limits)
- **Cold start performance** (first request after inactivity)

## 🔍 Testing Your Deployed App

1. **Test Pattern Search:**
   ```
   W___S → Should return ~115 results
   A____ → Should return ~1000+ results
   ```

2. **Test Advanced Search:**
   ```
   5 Letter, Starts with W, ends with S, also contains O
   → Should return ~19 results
   ```

3. **Test API Endpoint:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/search \
     -H "Content-Type: application/json" \
     -d '{"query": "W___S", "advanced": false}'
   ```

## 🚨 Troubleshooting

### Build Errors
- Ensure Node.js version is 18+
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Runtime Errors
- Check Vercel function logs
- Verify word dictionary file is accessible
- Check API endpoint response times

### Performance Issues
- Monitor function execution time
- Consider optimizing word dictionary size
- Use Vercel's edge functions if needed

## 📈 Scaling Considerations

- **Current setup**: Handles ~15,000 words efficiently
- **Large dictionaries**: Consider chunking or streaming
- **High traffic**: Monitor Vercel usage limits
- **Global users**: Vercel automatically handles CDN distribution

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` triggers automatic deployment
- Preview deployments for pull requests
- Automatic rollback on deployment failures

## 📞 Support

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Project Issues**: Check the GitHub repository

---

**Your Word Search App is now ready for the world! 🌍✨**
