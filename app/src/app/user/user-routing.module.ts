import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GoalsComponent } from './goals/goals.component';
import { GoalDashboardComponent } from './goals/dashboard/dashboard.component';
import { ObjectivesComponent } from './goals/objectives/objectives.component';
import { AiComponent } from './ai/ai.component';
import { CalendarComponent } from './goals/calendar/calendar.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: DashboardComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'goals', component: GoalsComponent },
            // { path: 'ai', component: AiComponent },
            { path: 'goals/dashboard', component: GoalDashboardComponent },
            { path: 'goals/objectives', component: ObjectivesComponent },
            { path: 'goals/calendar', component: CalendarComponent },
            { path: '**', redirectTo: '/dashboard' },
        ]),
    ],
    exports: [RouterModule],
})
export class UserRoutingModule {}
