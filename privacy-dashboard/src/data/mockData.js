export function getMockTorStats() {
  return {
    upload: Math.floor(Math.random() * 800),
    download: Math.floor(Math.random() * 800),
    totalSent: Math.floor(Math.random() * 50000),
    totalReceived: Math.floor(Math.random() * 50000),
    circuits: Math.floor(Math.random() * 4) + 1,
    nodes: [
      "France → Germany → Canada",
      "Spain → Netherlands → USA",
      "Italy → Switzerland → UK"
    ],
    history: Array.from({ length: 10 }).map((_, i) => ({
      time: i,
      upload: Math.random() * 800,
      download: Math.random() * 800,
    })),
  };
}

export function getMockAdblockStats() {
  const total = 2000;
  const blocked = Math.floor(Math.random() * 400);

  return {
    total,
    blocked,
    percent: Math.round((blocked / total) * 100),
    topDomains: [
      { domain: "doubleclick.net", hits: Math.floor(Math.random() * 200) },
      { domain: "ads.google.com", hits: Math.floor(Math.random() * 150) },
      { domain: "tracker.com", hits: Math.floor(Math.random() * 100) },
      { domain: "facebook.net", hits: Math.floor(Math.random() * 90) },
    ],
    whitelist: [
      "example.com",
      "trustedsite.org"
    ],
    history: Array.from({ length: 10 }).map((_, i) => ({
      time: i,
      blocked: Math.random() * 400
    }))
  };
}
