# Vicina V-1 Assembly Instructions for GitHub Copilot

## Context
You are helping build Vicina, a real-time social presence platform for spontaneous meetups. This is a 48-hour Version -1 build focused on the Winston-Salem Innovation Quarter pilot. The tech stack is React + Vite + Firebase (Auth + Firestore).

## Project Goals
- Create a working technical probe to validate core concept
- Enable real-time check-ins with 90-minute auto-expiry
- Provide venue-based chat rooms
- Mobile-responsive PWA
- Deploy to production for user testing

---

## PHASE 1: LOCAL SETUP (30 minutes)

### Step 1: Initialize Project Locally
```bash
# Navigate to the project directory
cd vicina-v1

# Install all dependencies
npm install

# Verify installation
npm run dev
# Should start dev server but will error on Firebase config
```

### Step 2: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add Project" or "Create a project"
3. Project name: `vicina-v1-pilot` (or your choice)
4. Disable Google Analytics (not needed for V-1)
5. Click "Create Project"

### Step 3: Enable Firebase Authentication
1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get Started"
3. Click "Sign-in method" tab
4. Click "Email/Password"
5. Toggle "Enable" to ON
6. Click "Save"

### Step 4: Create Firestore Database
1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in test mode" (we'll secure it later)
4. Choose location: `us-east1` (or closest to Winston-Salem)
5. Click "Enable"

### Step 5: Get Firebase Configuration
1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. App nickname: `Vicina Web`
5. Don't check "Firebase Hosting" (we'll use Vercel/Netlify)
6. Click "Register app"
7. Copy the `firebaseConfig` object

### Step 6: Add Firebase Credentials to Project
Open `src/firebase/config.js` and replace the placeholder config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // Paste your actual values here
  authDomain: "vicina-v1-pilot.firebaseapp.com",
  projectId: "vicina-v1-pilot",
  storageBucket: "vicina-v1-pilot.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 7: Test Local Development
```bash
npm run dev
```

Expected behavior:
- Browser opens to `http://localhost:5173`
- You see the Vicina login screen
- No console errors related to Firebase

---

## PHASE 2: SECURE FIRESTORE (15 minutes)

### Step 8: Update Firestore Security Rules
Current rules (test mode) allow anyone to read/write. We need to secure this.

1. In Firebase Console → Firestore Database
2. Click "Rules" tab
3. Replace existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check-ins collection
    match /checkIns/{checkInId} {
      // Anyone can read active check-ins
      allow read: if true;
      
      // Only authenticated users can create check-ins
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Only the owner can delete their check-in
      allow delete: if request.auth != null 
                    && resource.data.userId == request.auth.uid;
      
      // No updates allowed (users should delete and recreate)
      allow update: if false;
    }
    
    // Messages collection
    match /messages/{messageId} {
      // Anyone can read messages
      allow read: if true;
      
      // Only authenticated users can create messages
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // No updates or deletes (chat history is immutable for V-1)
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

4. Click "Publish"
5. Confirm the security warning

### Step 9: Create Firestore Indexes
For performance, we need composite indexes:

1. In Firebase Console → Firestore Database → "Indexes" tab
2. Click "Create Index"

**Index 1: Check-ins by venue and expiry**
- Collection ID: `checkIns`
- Fields:
  - `venueId` (Ascending)
  - `expiresAt` (Ascending)
- Query scope: Collection
- Click "Create"

**Index 2: Messages by venue and time**
- Collection ID: `messages`
- Fields:
  - `venueId` (Ascending)
  - `createdAt` (Ascending)
- Query scope: Collection
- Click "Create"

Note: Indexes take 5-10 minutes to build. You'll get an email when ready.

---

## PHASE 3: TESTING LOCALLY (30 minutes)

### Step 10: Create Test Accounts
In your browser at `http://localhost:5173`:

1. Click "Sign Up"
2. Create account:
   - Display Name: "Test User 1"
   - Email: `test1@vicina.local`
   - Password: `testpassword123`
3. You should be redirected to venue list

Open a **second browser** (or incognito window):
1. Go to `http://localhost:5173`
2. Create second account:
   - Display Name: "Test User 2"
   - Email: `test2@vicina.local`
   - Password: `testpassword123`

### Step 11: Test Check-in Flow
**Browser 1 (Test User 1):**
1. Click "Krankies Coffee (Factory)" card
2. Click "I'm Here" button
3. You should see "You're currently: HERE" message
4. Main venue list should now show "1 here" for Krankies

**Browser 2 (Test User 2):**
1. Verify you see "1 here" on Krankies card (real-time update)
2. Click "Krankies Coffee (Factory)"
3. Click "Heading There"
4. Both browsers should now show "1 here, 1 heading there"

### Step 12: Test Chat Functionality
**Browser 1:**
1. While in Krankies venue detail
2. Type in chat: "Hey, I'm at the back table"
3. Click "Send"

**Browser 2:**
1. Message should appear instantly in your chat
2. Reply: "Cool, I'll be there in 10 minutes"

**Browser 1:**
1. Should see Browser 2's message instantly

### Step 13: Test Check-in Removal
**Browser 1:**
1. Click "Remove Check-in" button
2. Your status card should disappear
3. Counts should update in both browsers

### Step 14: Test 90-Minute Expiry (Quick Test)
We can't wait 90 minutes, but we can verify the logic:

1. In Browser 1, create a new check-in
2. In Firebase Console → Firestore Database → Data tab
3. Find the `checkIns` collection
4. Click on the document you just created
5. Verify `expiresAt` timestamp is ~90 minutes in the future
6. Manually change `expiresAt` to a time in the past
7. Within seconds, the check-in should disappear from both browsers

---

## PHASE 4: PRODUCTION DEPLOYMENT (45 minutes)

### Step 15: Build for Production
```bash
# Create production build
npm run build

# Test production build locally
npm run preview
```

Visit `http://localhost:4173` and verify everything works.

### Step 16: Deploy to Vercel (Recommended)

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
# Follow prompts to authenticate

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? vicina-v1
# - Directory? ./
# - Build command? npm run build
# - Output directory? dist
# - Development command? npm run dev

# First deploy is preview, deploy to production:
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your Git repository (or drag/drop the `vicina-v1` folder)
4. Framework Preset: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click "Deploy"

### Step 17: Deploy to Netlify (Alternative)

**Option A: Netlify Drop**
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder from your project
3. Wait for deployment
4. Get your URL: `https://random-name-12345.netlify.app`

**Option B: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize and deploy
netlify init

# Follow prompts:
# - Create new site
# - Team: (your team)
# - Site name: vicina-v1-pilot
# - Build command: npm run build
# - Deploy directory: dist

# Deploy
netlify deploy --prod
```

### Step 18: Update Firebase Authorized Domains
Now that you have a production URL, add it to Firebase:

1. In Firebase Console → Authentication
2. Click "Settings" tab
3. Scroll to "Authorized domains"
4. Click "Add domain"
5. Add your Vercel/Netlify domain (e.g., `vicina-v1.vercel.app`)
6. Click "Add"

### Step 19: Test Production Deployment
1. Visit your production URL
2. Create a new account (use real email this time)
3. Test all flows: sign up, check-in, chat, logout, login
4. Test on mobile device (responsive design)
5. Test with a friend if possible

---

## PHASE 5: REFINEMENTS & POLISH (2-3 hours)

### Step 20: Add Loading States
Currently, the app doesn't show loading indicators. Let's add them.

**In VenueList.jsx:**
```javascript
// Add loading state
const [loading, setLoading] = useState(true);

// Update useEffect
useEffect(() => {
  const now = new Date();
  const checkInsQuery = query(
    collection(db, 'checkIns'),
    where('expiresAt', '>', now)
  );

  const unsubscribe = onSnapshot(checkInsQuery, (snapshot) => {
    // ... existing count logic ...
    setLoading(false);  // Add this
  });

  return () => unsubscribe();
}, []);

// Add loading UI before return
if (loading) {
  return (
    <div className="container">
      <h1>Vicina</h1>
      <p>Loading venues...</p>
    </div>
  );
}
```

### Step 21: Add Better Error Handling
**In Login.jsx:**
```javascript
// Improve error messages
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    if (isSignup) {
      await signup(email, password);
      if (displayName) {
        await updateUserProfile(displayName);
      }
    } else {
      await login(email, password);
    }
  } catch (err) {
    // Better error messages
    if (err.code === 'auth/email-already-in-use') {
      setError('This email is already registered. Try logging in instead.');
    } else if (err.code === 'auth/weak-password') {
      setError('Password should be at least 6 characters.');
    } else if (err.code === 'auth/invalid-email') {
      setError('Please enter a valid email address.');
    } else if (err.code === 'auth/user-not-found') {
      setError('No account found with this email.');
    } else if (err.code === 'auth/wrong-password') {
      setError('Incorrect password.');
    } else {
      setError(err.message);
    }
  }

  setLoading(false);
};
```

### Step 22: Add Timestamps to Chat Messages
**In VenueDetail.jsx, update message rendering:**
```javascript
{messages.map((msg) => {
  const timestamp = msg.createdAt?.toDate?.();
  const timeString = timestamp ? 
    timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  return (
    <div key={msg.id} style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong style={{ fontSize: '14px' }}>{msg.displayName}</strong>
        <span style={{ fontSize: '12px', color: '#999' }}>{timeString}</span>
      </div>
      <p style={{ fontSize: '14px', color: '#333' }}>{msg.text}</p>
    </div>
  );
})}
```

### Step 23: Add Empty States
**In VenueDetail.jsx, for empty chat:**
```javascript
<div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px' }}>
  {messages.length === 0 ? (
    <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
      No messages yet. Start the conversation!
    </p>
  ) : (
    messages.map((msg) => (
      // ... existing message rendering ...
    ))
  )}
  <div ref={messagesEndRef} />
</div>
```

### Step 24: Add PWA Manifest
Create `public/manifest.json`:
```json
{
  "name": "Vicina",
  "short_name": "Vicina",
  "description": "What's happening nearby",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Update `index.html`:
```html
<head>
  <!-- ... existing meta tags ... -->
  <link rel="manifest" href="/manifest.json" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
</head>
```

Note: You'll need to create icon images (192x192 and 512x512 PNG files).

### Step 25: Add Input Validation
**In VenueDetail.jsx, improve message input:**
```javascript
const handleSendMessage = async (e) => {
  e.preventDefault();
  
  const trimmed = newMessage.trim();
  if (!trimmed) return;
  
  if (trimmed.length > 500) {
    alert('Message is too long (max 500 characters)');
    return;
  }

  try {
    await addDoc(collection(db, 'messages'), {
      venueId,
      userId: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email,
      text: trimmed,
      createdAt: new Date()
    });
    setNewMessage('');
  } catch (err) {
    console.error('Send message error:', err);
    alert('Failed to send message. Please try again.');
  }
};
```

---

## PHASE 6: MONITORING & MAINTENANCE (Ongoing)

### Step 26: Set Up Firebase Usage Monitoring
1. In Firebase Console → Usage and billing
2. Review daily quotas:
   - Firestore: 50K reads/day (free tier)
   - Auth: Unlimited (free tier)
3. Set up budget alerts if concerned about scaling

### Step 27: Monitor User Activity
Check Firestore for active usage:
```bash
# In Firebase Console → Firestore Database → Data
# Monitor these collections:
# - checkIns: How many active?
# - messages: Message volume per venue?
# - Look for any abuse or spam
```

### Step 28: Create Backup/Cleanup Script
For later (not in 48-hour build), create a Cloud Function to clean up:
- Expired check-ins (older than 90 minutes)
- Old messages (older than 7 days)

This isn't critical for V-1 but good to keep in mind.

---

## TROUBLESHOOTING GUIDE

### Issue: "Firebase not configured" error
**Solution:** Check `src/firebase/config.js` has real credentials, not placeholders.

### Issue: Real-time updates not working
**Solution:** 
1. Check Firebase Rules are published
2. Check browser console for errors
3. Verify Firestore indexes are built (check email)

### Issue: Auth redirect loop
**Solution:** 
1. Check Firebase authorized domains includes your deployment URL
2. Clear browser cache/cookies
3. Check for console errors

### Issue: Check-ins not appearing
**Solution:**
1. Verify `expiresAt` is in the future
2. Check Firestore data directly in console
3. Check browser console for query errors

### Issue: Messages not sending
**Solution:**
1. Check `createdAt` field format (should be Firebase Timestamp)
2. Verify user has `displayName` set
3. Check Firestore security rules

### Issue: Counts showing wrong numbers
**Solution:**
1. Expired check-ins might not be filtered
2. Check query includes `where('expiresAt', '>', now)`
3. Verify date comparison logic

### Issue: Mobile layout broken
**Solution:**
1. Check viewport meta tag in `index.html`
2. Test in Chrome DevTools mobile mode
3. Verify CSS has proper responsive units (%, vh, vw)

---

## SUCCESS CRITERIA CHECKLIST

Before considering V-1 "done", verify:

- [ ] User can sign up with email/password
- [ ] User can log in and log out
- [ ] User sees list of 5 IQ venues
- [ ] Real-time counts update when other users check in
- [ ] User can check in as "HEADING" or "HERE"
- [ ] User can remove their check-in
- [ ] Check-ins expire after 90 minutes
- [ ] User can send chat messages in venue rooms
- [ ] Messages appear in real-time for all users
- [ ] Works on mobile devices (responsive)
- [ ] Deployed to production URL
- [ ] Firebase security rules are set
- [ ] No console errors in production

---

## NEXT STEPS AFTER V-1

Once V-1 is deployed and tested:

1. **User Recruitment** (Week 1)
   - Use the app yourself daily from different IQ locations
   - Screenshot it working
   - Approach friends/connections in person

2. **Feedback Collection** (Week 2-3)
   - Watch how people actually use it
   - Note friction points
   - Identify missing features that matter

3. **Decision Point** (Week 4)
   - Did anyone actually meet up?
   - Are people checking in consistently?
   - Is the chat useful or ignored?
   - Based on answers, decide: pivot, persist, or kill

Remember: This is Version -1, a technical probe. The goal is learning, not perfection.

---

## EMERGENCY CONTACTS & RESOURCES

- **Firebase Documentation:** https://firebase.google.com/docs
- **React Documentation:** https://react.dev
- **Vite Documentation:** https://vitejs.dev
- **Firestore Query Reference:** https://firebase.google.com/docs/firestore/query-data/queries

If you get stuck:
1. Check the browser console for errors
2. Check Firebase Console for usage/errors
3. Search error messages in documentation
4. Start fresh in a new browser/incognito window

Good luck with your 48-hour build! 🚀
