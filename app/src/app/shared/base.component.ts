import { OnDestroy, Directive } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Base component class that provides proper subscription management
 * All components should extend this class to prevent memory leaks
 *
 * Usage:
 * 1. Extend this class: export class MyComponent extends BaseComponent
 * 2. Use takeUntil(this.destroy$) in your subscriptions
 * 3. Call super.ngOnDestroy() if you override ngOnDestroy
 */
@Directive()
export abstract class BaseComponent implements OnDestroy {
    /** Subject that emits when component is destroyed */
    protected destroy$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
