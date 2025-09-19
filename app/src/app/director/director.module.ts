import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ChartModule } from 'primeng/chart';
// import { MenuModule } from 'primeng/menu';
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { StyleClassModule } from 'primeng/styleclass';
// import { PanelMenuModule } from 'primeng/panelmenu';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { UserComponent } from './user.component';
// import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
// import { GoalsComponent } from './goals/goals.component';
// import { ObjectivesComponent } from './goals/objectives/objectives.component';
// import { GoalDashboardComponent } from './goals/dashboard/dashboard.component';
import { AiComponent } from './ai/ai.component';
import { DirectorRoutingModule } from './director-routing.module';
import { GoalDashboardComponent } from './goal/dashboard/dashboard.component';
import { GoalComponent } from './goal/goal.component';
import { GoalTableComponent } from './goal/goal-table/goal-table.component';
import { AddGoalComponent } from './goal/add-goal/add-goal.component';
import { EditGoalComponent } from './goal/edit-goal/edit-goal.component';
import { DeleteFilesComponent } from './goal/delete-files/delete-files.component';
import { ObjectiveTableComponent } from './goal/objective-table/objective-table.component';
import { AddObjectiveComponent } from './goal/add-objective/add-objective.component';
import { EditObjectiveComponent } from './goal/edit-objective/edit-objective.component';
import { AddFilesComponent } from './goal/add-files/add-files.component';
import { ViewFilesComponent } from './goal/view-files/view-files.component';
import { DirectorComponent } from './director.component';
import { ViewFileHistoryComponent } from './goal/view-file-history/view-file-history.component';
import { PrintObjectiveTableComponent } from './goal/print-objective-table/print-objective-table.component';
import { RemarksComponent } from './goal/remarks/remarks.component';
import { PrintQomComponent } from './goal/print-qom/print-qom.component';

@NgModule({
    imports: [DirectorRoutingModule, SharedModule, DeleteFilesComponent],
    declarations: [
        EditGoalComponent,
        DirectorComponent,
        GoalComponent,
        AddGoalComponent,
        GoalDashboardComponent,
        AiComponent,
        GoalTableComponent,
        ObjectiveTableComponent,
        AddObjectiveComponent,
        EditObjectiveComponent,
        AddFilesComponent,
        ViewFilesComponent,
        ViewFileHistoryComponent,
        PrintObjectiveTableComponent,
        RemarksComponent,
        PrintQomComponent,
    ],
    providers: [FileUpload],
})
export class DirectorModule {}
