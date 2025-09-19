import { NgModule } from '@angular/core';

import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { GoalsComponent } from './goals/goals.component';
import { DepartmentsComponent } from './departments/departments.component';
import { LogsComponent } from './logs/logs.component';
import { GoalDashboardComponent } from './goals/dashboard/dashboard.component';
import { ObjectivesComponent } from './goals/objectives/objectives.component';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { SharedModule } from '../shared/shared.module';
import { AiComponent } from './ai/ai.component';
import { MarkdownModule } from 'ngx-markdown';
import { ReportingComponent } from './goals/reporting/reporting.component';
import 'prismjs';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
import { GoalManagementComponent } from './goal-management/goal-management.component';
import { AddGoalComponent } from './goal-management/add-goal/add-goal.component';
import { GoalTableComponent } from './goal-management/goal-table/goal-table.component';
import { AddingGoalComponent } from './goals/add-goal/adding-goal.component';
import { PrintTableComponent } from './goals/print-table/print-table.component';
import { AddObjectiveComponent } from './goals/add-objective/add-objective.component';
import { UpdateGoalComponent } from './goals/update-goal/update-goal.component';
import { UpdateObjectiveComponent } from './goals/update-objective/update-objective.component';
import { AddFilesComponent } from './goals/add-files/add-files.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { RemarksComponent } from './goals/remarks/remarks.component';
import { PrintQomComponent } from './goals/print-qom/print-qom.component';

@NgModule({
    imports: [AdminRoutingModule, SharedModule, MarkdownModule.forRoot()],
    declarations: [
        AdminComponent,
        DashboardComponent,
        UsersComponent,
        GoalsComponent,
        DepartmentsComponent,
        LogsComponent,
        GoalDashboardComponent,
        ObjectivesComponent,
        AiComponent,
        ReportingComponent,
        GoalManagementComponent,
        AddGoalComponent,
        AddingGoalComponent,
        GoalTableComponent,
        PrintTableComponent,
        AddObjectiveComponent,
        UpdateGoalComponent,
        UpdateObjectiveComponent,
        AddFilesComponent,
        AddUserComponent,
        EditUserComponent,
        RemarksComponent,
        PrintQomComponent,
    ],
    providers: [FileUpload],
})
export class AdminModule {}
