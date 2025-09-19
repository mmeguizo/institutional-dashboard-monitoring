import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user.component';
import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { GoalsComponent } from './goals/goals.component';
import { ObjectivesComponent } from './goals/objectives/objectives.component';
import { GoalDashboardComponent } from './goals/dashboard/dashboard.component';
import { AiComponent } from './ai/ai.component';

@NgModule({
    imports: [UserRoutingModule, SharedModule],
    declarations: [
        UserComponent,
        DashboardComponent,
        GoalsComponent,
        ObjectivesComponent,
        GoalDashboardComponent,
        AiComponent,
    ],
    providers: [FileUpload],
})
export class UserModule {}
