import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { LogService } from 'src/app/demo/service/logs.service';
import { Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { AuthService } from 'src/app/demo/service/auth.service';

interface PageEvent {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
}

LogService;
@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent {
    private getdepartmenttSubscription = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;
    logs: any[] = [];
    loading = true;
    cols!: any;
    first: number = 0;
    USERNAME: string;
    rows: number = 10;

    constructor(public log: LogService, private auth: AuthService) {
        this.USERNAME =
            this.auth.getTokenUsername() || localStorage.getItem('username');
        this.getAllLogs();
        this.cols = [
            { field: 'method', header: 'Action' },
            { field: 'status', header: 'Results' },
            { field: 'url', header: ' Api Call' },
            { field: 'user.username', header: 'User' },
            { field: 'createdAt', header: 'Date' },
        ];
    }

    async getAllLogs() {
        this.loading = true;
        this.log
            .getAllLogs(
                'get',
                'logs',
                'getAllLogs/' + this.auth.getTokenUserID()
            )
            .pipe(takeUntil(this.getdepartmenttSubscription))
            .subscribe((data: any) => {
                this.logs = data.data[0];
                this.loading = false;
            });
    }

    onPageChange(event: PageEvent) {
        this.first = event.first;
        this.rows = event.rows;
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    getArticle(resource: string): string {
        if (!resource) return '';
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        return vowels.includes(resource[0].toLowerCase()) ? 'an' : 'a';
    }

    // getLogDisplayValue(log: any): string {
    //     if (log?.objectives?.[0]?.functional_objective) {
    //         return log.objectives[0].functional_objective;
    //     } else if (log?.ParamsObjectives?.[0]?.functional_objective) {
    //         return log.ParamsObjectives[0].functional_objective;
    //     } else if (log?.body?._id) {
    //         return 'ID: ' + log.body._id;
    //     } else if (log?.body?.username === log?.user.username) {
    //         return 'For Himself';
    //     } else if (log?.body?.functional_objective) {
    //         return log.body.functional_objective;
    //     } else if (log?.goals?.[0]?.goals || log?.body?.goals) {
    //         return log?.goals?.[0]?.goals || log?.body?.goals;
    //     } else {
    //         return 'for Himself';
    //     }
    // }

    getLogDisplayValue(log: any): string {
        if (!log) {
            // Check if 'log' itself is undefined
            return 'Unknown'; // Or some other appropriate default value
        }

        if (log?.objectives?.[0]?.functional_objective) {
            return log.objectives[0].functional_objective;
        } else if (log?.ParamsObjectives?.[0]?.functional_objective) {
            return log.ParamsObjectives[0].functional_objective;
        } else if (log?.body?._id) {
            return 'ID: ' + log.body._id;
        } else if (
            log?.body?.username &&
            log?.user?.username &&
            log.body.username === log.user.username
        ) {
            return 'For Himself';
        } else if (log?.body?.functional_objective) {
            return log.body.functional_objective;
        } else if (log?.goals?.[0]?.goals || log?.body?.goals) {
            return log?.goals?.[0]?.goals || log?.body?.goals;
        } else {
            return 'for Himself';
        }
    }

    getUserProfilePic(image: any): string {
        return image?.user?.profile_pic === 'no-photo.png'
            ? image?.body?.profile_pic
                ? image?.body?.profile_pic
                : image?.user?.profile_pic
            : image?.user?.profile_pic;
    }
}
