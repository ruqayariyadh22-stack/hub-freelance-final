const PALETTE = ['#2563eb', '#0f766e', '#7c3aed', '#db2777', '#ea580c', '#0891b2'];

export const initialsAvatar = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  const initials = (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?').slice(0, 2))
    .toUpperCase();
  const color = PALETTE[[...String(name)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="20" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
