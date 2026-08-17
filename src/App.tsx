import React, { useState } from 'react';
import { Header, type PageId } from './components/Header';
import { FeedbackStudio } from './components/FeedbackStudio';
import { MetricsDashboard } from './components/MetricsDashboard';
import { PrivacyInspector } from './components/PrivacyInspector';
import { LiveFeedStream, type FeedItem } from './components/LiveFeedStream';
import './App.css';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('submit');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      hash: '0d60f46fac2086100035ce13375095fb6fce3c85d665c5c500720ca630f18ba9',
      rating: 5,
      category: 'Developer Experience',
      commentPreview: 'Compact circuit proving is fast and reliable.',
      timestamp: '5 mins ago',
    },
    {
      hash: '4a19b88e170020bc88e17a521a04f8dbd5244d63a59d8fbc2c9fc7ea521a04f8',
      rating: 4,
      category: 'Privacy & Security',
      commentPreview: 'Verified zero-linkability — submitter address is hidden.',
      timestamp: '12 mins ago',
    },
  ]);

  const handleFeedbackSubmitted = (record: FeedItem) => {
    setFeedItems((prev) => [record, ...prev]);
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
              <LiveFeedStream items={feedItems} />
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
