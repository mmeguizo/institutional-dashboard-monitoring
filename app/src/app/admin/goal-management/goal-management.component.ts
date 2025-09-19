import { Component } from '@angular/core';
import { AddGoalComponent } from './add-goal/add-goal.component';
AddGoalComponent;
@Component({
    selector: 'app-goal-management',
    templateUrl: './goal-management.component.html',
    styleUrl: './goal-management.component.scss',
})
export class GoalManagementComponent {
    public addGoalMessageResultsPost: { success: boolean; message: string };
    public newGoalData = {};
    public editGoalNameDataParent = {};
    // @Output() editGoalNameDataParent = new EventEmitter<any>();
    constructor() {}

    //original parent operation to the child
    async addGoalEvent(event: any) {
        this.newGoalData = event;
    }

    async editGoalName(event) {
        this.editGoalNameDataParent = event;
    }
}
