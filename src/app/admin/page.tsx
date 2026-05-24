import React from 'react';

export default function AdminPage() {
  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/admin_assets/index.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Admin Dashboard"
        allowFullScreen
      />
    </div>
  );
}
