export type AppTabName = 'index' | 'explore' | 'news' | 'account';

type Listener = () => void;

const listeners: Record<AppTabName, Set<Listener>> = {
  index: new Set<Listener>(),
  explore: new Set<Listener>(),
  news: new Set<Listener>(),
  account: new Set<Listener>(),
};

export function emitTabRefresh(tab: AppTabName) {
  listeners[tab].forEach((listener) => listener());
}

export function subscribeTabRefresh(tab: AppTabName, listener: Listener) {
  listeners[tab].add(listener);
  return () => {
    listeners[tab].delete(listener);
  };
}
