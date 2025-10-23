import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidenavService {
  readonly opened = signal(false);

  toggle(): void {
    this.opened.update((v) => !v);
  }
  open(): void {
    this.opened.set(true);
  }
  close(): void {
    this.opened.set(false);
  }

  initAutoClose(breakpointPx = 920): void {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const handler = (e: MediaQueryList | MediaQueryListEvent) => {
      if ((mq as MediaQueryList).matches) this.close();
    };
    handler(mq);
    mq.addEventListener('change', handler as any);
  }
}
