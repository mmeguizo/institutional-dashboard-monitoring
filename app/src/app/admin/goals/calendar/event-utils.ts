import { EventInput } from '@fullcalendar/core';

let eventGuid = 0;
const TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

export const INITIAL_EVENTS: EventInput[] = [
    {
        id: createEventId(),
        title: 'All-day event',
        start: TODAY_STR,
    },
    {
        id: createEventId(),
        title: 'Timed event',
        start: TODAY_STR + 'T00:00:00',
        end: TODAY_STR + 'T03:00:00',
    },
    {
        id: createEventId(),
        title: 'Timed event',
        start: TODAY_STR + 'T12:00:00',
        end: TODAY_STR + 'T15:00:00',
    },
];

export function createEventId() {
    return String(eventGuid++);
}

/*

    events: this.fetchEvents.bind(this), // Fetch events dynamically
  });

  constructor(private obj: ObjectiveService) {}

  ngOnInit() {
    // Consider fetching initial events here if needed
  }

  fetchEvents(fetchInfo: { start: Date, end: Date, successCallback: (events: EventInput[]) => void }) {
    this.obj.getRoute('get', 'objectives', 'getObjectiveForCalendar') // Or your API endpoint
      .subscribe((data: any) => {
        const events: EventInput[] = data.data.map((objective: any) => ({
          id: objective.id,
          title: objective.title,
          start: objective.startDate,
          end: objective.endDate
          // Map other objective properties to event properties as needed
        }));
        fetchInfo.successCallback(events);
      });
  }

*/
