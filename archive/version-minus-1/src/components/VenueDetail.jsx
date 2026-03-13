import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { venues } from '../data/venues';
import { useAuth } from '../contexts/AuthContext';
import '../styles/VenueDetail.css';

export default function VenueDetail() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [checkIns, setCheckIns] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userCheckIn, setUserCheckIn] = useState(null);
  const messagesEndRef = useRef(null);

  const venue = venues.find(v => v.id === venueId);

  useEffect(() => {
    if (!venue) return;

    const now = new Date();
    const checkInsQuery = query(
      collection(db, 'checkIns'),
      where('venueId', '==', venueId),
      where('expiresAt', '>', now)
    );

    const unsubscribe = onSnapshot(checkInsQuery, (snapshot) => {
      const checkInsData = [];
      let foundUserCheckIn = null;

      snapshot.forEach((docSnapshot) => {
        const data = { id: docSnapshot.id, ...docSnapshot.data() };
        checkInsData.push(data);
        
        if (data.userId === currentUser.uid) {
          foundUserCheckIn = data;
        }
      });

      setCheckIns(checkInsData);
      setUserCheckIn(foundUserCheckIn);
    });

    return () => unsubscribe();
  }, [venueId, venue, currentUser]);

  useEffect(() => {
    if (!venue) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('venueId', '==', venueId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((docSnapshot) => {
        messagesData.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [venueId, venue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!venue) {
    return (
      <div className="container">
        <p>Venue not found</p>
        <button onClick={() => navigate('/')}>Back to Venues</button>
      </div>
    );
  }

  const handleCheckIn = async (status) => {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 90);

      await addDoc(collection(db, 'checkIns'), {
        venueId,
        userId: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email,
        status,
        createdAt: new Date(),
        expiresAt
      });
    } catch (err) {
      console.error('Check-in error:', err);
      alert('Failed to check in. Please try again.');
    }
  };

  const handleRemoveCheckIn = async () => {
    if (!userCheckIn) return;

    try {
      await deleteDoc(doc(db, 'checkIns', userCheckIn.id));
    } catch (err) {
      console.error('Remove check-in error:', err);
      alert('Failed to remove check-in. Please try again.');
    }
  };

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

  const hereCounts = checkIns.filter(c => c.status === 'HERE').length;
  const headingCounts = checkIns.filter(c => c.status === 'HEADING').length;

  return (
    <div className="container">
      <button onClick={() => navigate('/')} className="btn-back">
        ← Back
      </button>

      <div className="venue-header">
        <h1>{venue.name}</h1>
        <p className="venue-address">{venue.address}</p>
        <p className="venue-type">{venue.type}</p>
      </div>

      <div className="counts-summary">
        <span className="count-item here">{hereCounts} here</span>
        <span className="count-item heading">{headingCounts} heading there</span>
      </div>

      {userCheckIn ? (
        <div className="user-status">
          <p>You're currently: <strong>{userCheckIn.status}</strong></p>
          <button onClick={handleRemoveCheckIn} className="btn-secondary">
            Remove Check-in
          </button>
        </div>
      ) : (
        <div className="check-in-buttons">
          <button onClick={() => handleCheckIn('HERE')} className="btn-primary">
            I'm Here
          </button>
          <button onClick={() => handleCheckIn('HEADING')} className="btn-secondary">
            Heading There
          </button>
        </div>
      )}

      <div className="chat-section">
        <h2>Chat</h2>
        <div className="messages-container">
          {messages.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const timestamp = msg.createdAt?.toDate?.();
              const timeString = timestamp
                ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div key={msg.id} className="message">
                  <div className="message-header">
                    <strong className="message-author">{msg.displayName}</strong>
                    <span className="message-time">{timeString}</span>
                  </div>
                  <p className="message-text">{msg.text}</p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="submit" className="btn-send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
