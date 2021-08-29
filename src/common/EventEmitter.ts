export type AEventsMap = Record<string, any[]>;

type EventsCenter<T extends AEventsMap> = {
  [K in keyof T]: ((...args: T[K]) => void)[];
};
export class EventEmitter<EventsMap extends AEventsMap> {
  protected events: Partial<EventsCenter<EventsMap>> = {};
  on<Event extends keyof EventsMap>(event: Event, fn: (...args: EventsMap[Event]) => void) {
    const fns = this.events[event] || [];
    if (!fns) return;
    const alreadyIn = fns.findIndex((_fn) => _fn === fn) > -1;
    if (!alreadyIn) {
      fns.push(fn);
    }
    this.events[event] = fns;
  }
  off<Event extends keyof EventsMap>(event: Event, fn: (...args: EventsMap[Event]) => void) {
    const fns = this.events[event];
    if (!fns) return;
    const index = fns.findIndex((item) => item === fn);
    if (index > -1) {
      fns.splice(index, 1);
    }
  }

  offAll(): void {
    for (const type in this.events) {
      this.events[type] = [];
    }
  }

  emit<Event extends keyof EventsMap>(event: Event, ...args: EventsMap[Event]) {
    const fns = this.events[event];
    if (!fns) return;
    fns.forEach((fn) => {
      fn.apply(this, args);
    });
  }
}
