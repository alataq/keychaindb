export const enum EventType {
    REPEATABLE,
    ONCE
}

interface Event {
    name: string;
    type: EventType;
    callback: (...args: any[]) => void;
}

export class EventManager {
    private events: Event[] = [];

    public register(event: Event): void {
        const exists = this.events.some(
            e => e.name === event.name && e.callback === event.callback
        );

        if (!exists) {
            this.events.push(event);
        }
    }

    public purge(name?: string): void {
        if (!name) {
            this.events.length = 0;
            return;
        }

        this.events = this.events.filter(event => event.name !== name);
    }

    public emit(name: string, ...args: any[]): void {
        const matchingEvents = this.events.filter(e => e.name === name);

        for (const event of matchingEvents) {
            event.callback(...args);
        }
        
        this.events = this.events.filter(event => 
            event.name !== name || (event.name === name && event.type === EventType.REPEATABLE)
        );
    }
}