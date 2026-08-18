import React, { useState, useEffect } from 'react';
import { Header, type PageId } from './components/Header';
import { FeedbackStudio } from './components/FeedbackStudio';
import { MetricsDashboard } from './components/MetricsDashboard';
import { PrivacyInspector } from './components/PrivacyInspector';
import { LiveFeedStream, type FeedItem } from './components/LiveFeedStream';
import './App.css';

const ACTIVITY_STORAGE_KEY = 'midnight_whisper_activity_log';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('submit');
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore storage parse errors
      }
    }
    return [];
  });

  // Check URL params on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['submit', 'analytics', 'privacy', 'explorer'].includes(tab)) {
        setActivePage(tab as PageId);
      }
    }
  }, []);

  const handleFeedbackSubmitted = (record: FeedItem) => {
    setFeedItems((prev) => {
      const updated = [record, ...prev];
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const handleClearActivity = () => {
    setFeedItems([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    }
  };

  return (
    <div className="site-layout">
      {/* Top Navbar */}
      <Header activePage={activePage} setActivePage={setActivePage} />

      {/* Centered Main Content */}
      <main className="main-content-centered">
        <div className="page-container">
          {activePage === 'submit' && (
            <div className="view-fade-in">
              <FeedbackStudio onFeedbackSubmitted={handleFeedbackSubmitted} />
            </div>
          )}

          {activePage === 'analytics' && (
            <div className="view-fade-in">
              <MetricsDashboard />
            </div>
          )}

          {activePage === 'privacy' && (
            <div className="view-fade-in">
              <PrivacyInspector />
            </div>
          )}

          {activePage === 'explorer' && (
            <div className="view-fade-in">
              <LiveFeedStream
                items={feedItems}
                onGoToSubmit={() => setActivePage('submit')}
                onClearActivity={handleClearActivity}
              />
            </div>
          )}
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-copy">Midnight Whisper • Zero-Knowledge Anonymous Feedback Protocol</span>
          <div className="footer-links">
            <button type="button" onClick={() => setActivePage('submit')} className="footer-link">Feedback</button>
            <button type="button" onClick={() => setActivePage('analytics')} className="footer-link">Analytics</button>
            <button type="button" onClick={() => setActivePage('privacy')} className="footer-link">Privacy</button>
            <button type="button" onClick={() => setActivePage('explorer')} className="footer-link">Activity</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
