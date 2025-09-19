import {
    Component,
    signal,
    ChangeDetectorRef,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
    CalendarOptions,
    DateSelectArg,
    EventClickArg,
    EventApi,
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { createEventId } from './event-utils'; // Update: remove INITIAL_EVENTS
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, RouterOutlet, FullCalendarModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy {
    COLORS = ['#f06292', '#ba68c8', '#4dd0e1', '#aed581', '#ffca28'];
    calendarVisible = signal(true);
    private objectiveSubscription = new Subject<void>();
    calendarOptions = signal<CalendarOptions>({
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        },
        initialView: 'dayGridMonth',
        weekends: true,
        editable: false,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: false,
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
    });
    currentEvents = signal<EventApi[]>([]);
    loading = true;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private obj: ObjectiveService,
        private auth: AuthService
    ) {}

    ngOnInit() {
        this.getAllobjectivesGoalsUsers();
    }

    getAllobjectivesGoalsUsers() {
        this.loading = true;
        this.obj
            .fetch('get', 'objectives', 'getObjectiveForCalendar')
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe(
                (data: any) => {
                    const events = this.transformEvents(data.data);
                    this.updateCalendarEvents(events);
                    this.loading = false;
                },
                (error) => {
                    console.error('Error fetching events', error);
                    this.loading = false;
                }
            );
    }

    transformEvents(data: any[]): any[] {
        //   this.color = item.backgroundColor || this.COLORS[Math.floor(Math.random() * this.COLORS.length)]
        return data.map((item) => ({
            id: item.id,
            user: item.users.username,
            image_url: this.auth.domain + item.users.profile_pic,
            title: item.goals.goals,
            start: item.timetable[0],
            end: item.timetable[1],
            backgroundColor:
                item.backgroundColor ||
                this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
            borderColor:
                item.backgroundColor ||
                this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
            allDay: true,
        }));
    }

    updateCalendarEvents(events: any[]) {
        this.calendarOptions.update((options) => ({
            ...options,
            events: events,
        }));
    }

    ngOnDestroy(): void {
        this.objectiveSubscription.unsubscribe();
    }

    handleCalendarToggle() {
        this.calendarVisible.update((bool) => !bool);
    }

    handleWeekendsToggle() {
        this.calendarOptions.update((options) => ({
            ...options,
            weekends: !options.weekends,
        }));
    }

    handleDateSelect(selectInfo: DateSelectArg) {
        // const title = prompt('Please enter a new title for your event');
        // const calendarApi = selectInfo.view.calendar;
        // calendarApi.unselect(); // clear date selection
        // if (title) {
        //     calendarApi.addEvent({
        //         id: createEventId(),
        //         title,
        //         start: selectInfo.startStr,
        //         end: selectInfo.endStr,
        //         allDay: selectInfo.allDay,
        //     });
        // }
    }

    handleEventClick(clickInfo: EventClickArg) {
        // if (
        //     confirm(
        //         `Are you sure you want to delete the event '${clickInfo.event.title}'`
        //     )
        // ) {
        //     clickInfo.event.remove();
        // }
    }

    handleEvents(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }
}
