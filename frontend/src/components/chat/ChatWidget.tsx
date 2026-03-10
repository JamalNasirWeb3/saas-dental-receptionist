'use client';

import { useState, useEffect } from 'react';
import ChatPage from './ChatPage';

function ToothIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" width="28" height="28">
      <path d="M32 4C24 4 18 10 18 18c0 4 1.5 7.5 1.5 11C19.5 33.5 18 37 18 41c0 8 5 14 10 14 3 0 4-2 4-2s1 2 4 2c5 0 10-6 10-14 0-4-1.5-7.5-1.5-11C44.5 25.5 46 22 46 18c0-8-6-14-14-14z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={20} height={20}>
      <line x1={18} y1={6} x2={6} y2={18} />
      <line x1={6} y1={6} x2={18} y2={18} />
    </svg>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setShowGreeting(false);
    };
    window.addEventListener('open-chat', handler);
    return () => window.removeEventListener('open-chat', handler);
  }, []);

  function toggle() {
    setIsOpen((o) => !o);
    setShowGreeting(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel — kept mounted to preserve session across opens */}
      <div
        className={`${isOpen ? 'flex flex-col' : 'hidden'} w-[370px] rounded-2xl overflow-hidden border border-grey-200`}
        style={{ height: 580, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
      >
        <ChatPage embedded onClose={() => setIsOpen(false)} />
      </div>

      {/* Greeting bubble */}
      {!isOpen && showGreeting && (
        <div
          className="bg-white border border-grey-200 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-grey-800 max-w-[230px]"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
        >
          <span className="mr-1">🦷</span>
          <span className="font-semibold">How can I assist You?</span>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="w-14 h-14 bg-blue-700 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{ boxShadow: '0 4px 20px rgba(25,118,210,0.5)' }}
      >
        {isOpen ? <CloseIcon /> : <ToothIcon />}
      </button>
    </div>
  );
}
