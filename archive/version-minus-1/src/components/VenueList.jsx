import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { venues } from '../data/venues';
import { useAuth } from '../contexts/AuthContext';
import '../styles/VenueList.css';

export default function VenueList() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const now = new Date();
    const checkInsQuery = query(
      collection(db, 'checkIns'),
      where('expiresAt', '>', now)
    );

    const unsubscribe = onSnapshot(checkInsQuery, (snapshot) => {
      const newCounts = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const venueId = data.venueId;
        const status = data.status;

        if (!newCounts[venueId]) {
          newCounts[venueId] = { here: 0, heading: 0 };
        }

        if (status === 'HERE') {
          newCounts[venueId].here += 1;
        } else if (status === 'HEADING') {
          newCounts[venueId].heading += 1;
        }
      });

      setCounts(newCounts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1>Rally</h1>
        <p>Loading venues...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Rally</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Log Out
        </button>
      </div>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Where are people right now?
      </p>

      <div className="venue-grid">
        {venues.map((venue) => {
          const venueCounts = counts[venue.id] || { here: 0, heading: 0 };
          const total = venueCounts.here + venueCounts.heading;

          return (
            <Link
              key={venue.id}
              to={`/venue/${venue.id}`}
              className="venue-card"
            >
              <div>
                <h3>{venue.name}</h3>
                <p className="venue-address">{venue.address}</p>
                <p className="venue-type">{venue.type}</p>
              </div>
              {total > 0 && (
                <div className="venue-counts">
                  {venueCounts.here > 0 && (
                    <span className="count-badge here">
                      {venueCounts.here} here
                    </span>
                  )}
                  {venueCounts.heading > 0 && (
                    <span className="count-badge heading">
                      {venueCounts.heading} heading there
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
