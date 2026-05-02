# Vicina V-1

Real-time social presence platform for spontaneous meetups in Winston-Salem Innovation Quarter.

## Tech Stack

- React 18
- Vite
- Firebase (Auth + Firestore)
- React Router

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firebase Authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase configuration
5. Update `src/firebase/config.js` with your credentials

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Firebase Security Rules

Apply these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /checkIns/{checkInId} {
      allow read: if true;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null 
                    && resource.data.userId == request.auth.uid;
      allow update: if false;
    }
    
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

## Firestore Indexes

Create these composite indexes in Firebase Console → Firestore Database → Indexes:

1. **Check-ins by venue and expiry**
   - Collection: `checkIns`
   - Fields: `venueId` (Ascending), `expiresAt` (Ascending)

2. **Messages by venue and time**
   - Collection: `messages`
   - Fields: `venueId` (Ascending), `createdAt` (Ascending)

## Features

- Email/password authentication
- Real-time check-ins with 90-minute auto-expiry
- Venue-based chat rooms
- Mobile-responsive design
- PWA-ready

## Winston-Salem IQ Venues

1. Krankies Coffee (Factory)
2. Footnote
3. Camino Bakery
4. Incendiary Brewing
5. Innovation Quarter Park

## Deployment

Deploy to Vercel or Netlify:

**Vercel:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Don't forget to add your deployment domain to Firebase authorized domains!

## License

MIT
