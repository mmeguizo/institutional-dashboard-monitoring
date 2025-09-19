import {
    Component,
    Output,
    EventEmitter,
    Input,
    OnInit,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
    FormArray,
} from '@angular/forms';
import { AuthService } from 'src/app/demo/service/auth.service';

import { GoallistService } from 'src/app/demo/service/goallists.service';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-add-goal',
    templateUrl: './add-goal.component.html',
    styleUrl: './add-goal.component.scss',
})
export class AddGoalComponent implements OnInit {
    @Output() addGoalEvent = new EventEmitter<any>();
    @Input() editGoalNameData: any;
    @Input() addGoalMessageResults: any;
    public addGoalform: FormGroup;
    editing: boolean = false;
    products: any[] = [];
    newData: any;
    initialGoalValue: any;
    private goallistSubscription = new Subject<void>();

    constructor(
        private formBuilder: FormBuilder,
        private goallistService: GoallistService,
        private messageService: MessageService,
        public auth: AuthService
    ) {
        this.createAddGoalForm();
    }
    ngOnInit(): void {
        //check if the form input has been cleared
        this.addGoalform
            .get('goals')
            ?.valueChanges.subscribe((currentValue) => {
                if (currentValue === '' && this.initialGoalValue) {
                    this.editing = false;
                    // Input has been cleared, revert to 'add' mode
                    // ... your logic to switch to 'add' mode
                    this.initialGoalValue = null; // Reset the initial value
                }
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['editGoalNameData']) {
            this.newData = changes['editGoalNameData'].currentValue;

            // Check if newData is not empty and has 'goals' and 'objectives'
            if (this.newData && this.newData.goals && this.newData.objectives) {
                // Patch the 'goals' field
                this.addGoalform.patchValue({
                    goals: this.newData.goals,
                });

                // Check if newData.objectives is an array
                if (Array.isArray(this.newData.objectives)) {
                    // Clear existing objectives and add new ones from newData
                    this.objectivesArray.clear();
                    this.newData.objectives.forEach((objectiveData: any) => {
                        this.objectivesArray.push(
                            this.formBuilder.group({
                                objective: objectiveData.objective,
                            })
                        );
                    });
                }

                this.initialGoalValue = this.newData.goals;
                this.editing = true;
            } else {
                // Reset form and set editing to false if no meaningful data is received
                this.addGoalform.reset();
                this.editing = false;
            }
        }
    }

    createAddGoalForm() {
        this.addGoalform = this.formBuilder.group({
            goals: ['', [Validators.required]],
            objectives: this.formBuilder.array([this.createObjective()]), // FormArray of FormGroups
        });
    }

    createObjective(): FormGroup {
        return this.formBuilder.group({
            objective: ['', Validators.required], // FormGroup with a single 'objective' control
        });
    }

    get objectivesArray(): FormArray {
        return this.addGoalform.get('objectives') as FormArray;
    }

    addObjective() {
        this.objectivesArray.push(this.createObjective());
    }

    removeObjective(index: number) {
        this.objectivesArray.removeAt(index);
    }

    addGoalExec(form: FormGroup) {
        let newobjectives = [];

        let { goals, objectives } = form.value;
        newobjectives.push(
            objectives.map((e) => {
                return {
                    objective: e.objective,
                    createdBy: this.auth.getTokenUserID(),
                };
            })
        );

        let data = {
            goals: goals,
            createdBy: this.auth.getTokenUserID(),
            objectives: newobjectives,
        };

        this.goallistService
            .getRoute('post', 'goallists', 'addGoal', form.value)
            .pipe(takeUntil(this.goallistSubscription))
            .subscribe({
                next: (data: any) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `${form.value.goals} added successfully`,
                    }); // Display error message
                    this.clearForm();
                    this.addGoalEvent.emit({ success: true, data: data.data });
                },
                error: (error) => {
                    console.error('Error fetching data:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to add goal',
                    }); // Display error message
                },
            });
    }

    updateGoal(form: FormGroup) {
        this.goallistService
            .getRoute('put', 'goallists', 'updateGoalList', {
                id: this.newData.id,
                goals: form.value.goals,
                objectives: form.value.objectives,
            })
            .pipe(takeUntil(this.goallistSubscription))
            .subscribe({
                next: (data: any) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `${form.value.goals} updated successfully`,
                    });
                    this.clearForm();
                    this.addGoalEvent.emit({ success: true, data: data.data });
                    this.editing = false;
                },
                error: (error) => {
                    console.error('Error updating data:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update goal',
                    });
                },
            });
    }

    clearForm() {
        this.addGoalform.reset(); // Reset the entire form
        // Reset objectives array to its default state (one objective)
        this.objectivesArray.clear();
        this.objectivesArray.push(this.createObjective());
        this.editing = false; // Reset editing flag if needed
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.goallistSubscription.next();
        this.goallistSubscription.complete();
    }
}
