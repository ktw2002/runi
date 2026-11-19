// 홈 화면 앱 설치에 필요한 기본 서비스워커 (저장 · 캐시는 하지 않아요)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
