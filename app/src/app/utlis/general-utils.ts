import { FormControl, Validators } from '@angular/forms';

export function abbreviateNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '0';
    }
    if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(1) + 'M';
    } else if (value >= 1_000) {
        return (value / 1_000).toFixed(1) + 'k';
    } else {
        return value.toString();
    }
}

export const abbreviatePercentage = (value: number): string => {
    return value + '%';
};

export function populateAndUpdateData(
    formValue: any,
    originalDataToCompare: any,
    currentDate: string
): any {
    const data: any = {};

    // Populate data object based on form values
    for (const key in formValue) {
        if (formValue[key] !== '') {
            data[key] = formValue[key];
        }
    }

    // Update date fields based on frequency and changes
    if (formValue.frequency_monitoring === 'monthly') {
        for (let i = 0; i <= 11; i++) {
            if (
                formValue[`month_${i}`] !== undefined &&
                formValue[`month_${i}`] !== null &&
                formValue[`month_${i}`] !== originalDataToCompare[`month_${i}`]
            ) {
                data[`month_${i}_date`] = currentDate;
            }
        }
    } else if (formValue.frequency_monitoring === 'quarterly') {
        for (let i = 0; i <= 3; i++) {
            if (
                formValue[`quarter_${i}`] !== undefined &&
                formValue[`quarter_${i}`] !== null &&
                formValue[`quarter_${i}`] !==
                    originalDataToCompare[`quarter_${i}`]
            ) {
                data[`quarter_${i}_date`] = currentDate;
            } else if (originalDataToCompare[`quarter_${i}_date`]) {
                data[`quarter_${i}_date`] =
                    originalDataToCompare[`quarter_${i}_date`];
            }
            if (
                formValue[`semi_annual_${i}`] !== undefined &&
                formValue[`semi_annual_${i}`] !== null &&
                formValue[`semi_annual_${i}`] !==
                    originalDataToCompare[`semi_annual_${i}`]
            ) {
                data[`semi_annual_${i}_date`] = currentDate;
            } else {
                data[`semi_annual_${i}_date`] =
                    originalDataToCompare[`semi_annual_${i}_date`];
            }
        }
    } else if (formValue.frequency_monitoring === 'yearly') {
        if (
            formValue[`yearly_0`] !== undefined &&
            formValue[`yearly_0`] !== null &&
            formValue[`yearly_0`] !== originalDataToCompare[`yearly_0`]
        ) {
            data[`yearly_0_date`] = currentDate;
        } else {
            data[`yearly_0_date`] = originalDataToCompare[`yearly_0_date`];
        }
    }

    return data;
}
export async function addMonthlyControls(form: any, months: any[], data?: any) {
    months.forEach((_, i) => {
        form.removeControl(`month_${i}`);
        form.removeControl(`file_month_${i}`);

        const monthValue = data ? data[`month_${i}`] || 0 : 0;
        const fileMonthValue = data[`file_month_${i}`]
            ? '💾 File Added...'
            : '';
        form.addControl(
            `month_${i}`,
            new FormControl(monthValue, Validators.min(0))
        );
        form.addControl(`file_month_${i}`, new FormControl(fileMonthValue));
    });
}

export async function addQuarterlyControls(
    form: any,
    quarters: any[],
    data?: any
) {
    quarters.forEach((_, i) => {
        form.removeControl(`quarter_${i}`);
        form.removeControl(`file_quarter_${i}`);

        const quarterValue = data ? data[`quarter_${i}`] || 0 : 0;
        const fileQuarterValue = data[`file_quarter_${i}`]
            ? '💾 File Added...'
            : '';
        form.addControl(
            `quarter_${i}`,
            new FormControl(quarterValue, Validators.min(0))
        );
        form.addControl(`file_quarter_${i}`, new FormControl(fileQuarterValue));
    });
}

export async function addSemiAnnualControls(
    form: any,
    semi_annual: any[],
    data?: any
) {
    semi_annual.forEach((_, i) => {
        form.removeControl(`semi_annual_${i}`);
        form.removeControl(`file_semi_annual_${i}`);

        const monthValue = data ? data[`semi_annual_${i}`] || 0 : 0;
        const fileSemiAnnualValue = data[`file_semi_annual_${i}`]
            ? '💾 File Added...'
            : '';
        form.addControl(
            `semi_annual_${i}`,
            new FormControl(monthValue, Validators.min(0))
        );
        form.addControl(
            `file_semi_annual_${i}`,
            new FormControl(fileSemiAnnualValue)
        );
    });
}

export async function addYearlyControls(form: any, yearly: any[], data?: any) {
    yearly.forEach((_, i) => {
        form.removeControl(`yearly_${i}`);
        form.removeControl(`file_yearly_${i}`);

        const yearlyValue = data ? data[`yearly_${i}`] || 0 : 0;
        const fileYearlyValue =
            data && data[`file_yearly_${i}`] ? '💾 File Added...' : '';
        form.addControl(
            `yearly_${i}`,
            new FormControl(yearlyValue, Validators.min(0))
        );
        form.addControl(`file_yearly_${i}`, new FormControl(fileYearlyValue));
    });
}

export async function clearDynamicControls(
    form: any,
    months: any[],
    yearly: any[],
    quarters: any[],
    semi_annual: any[]
) {
    // Clear monthly controls
    months.forEach((_, i) => {
        if (form.contains(`month_${i}`)) {
            form.removeControl(`month_${i}`);
        }
    });

    // Clear yearly controls
    yearly.forEach((_, i) => {
        if (form.contains(`yearly_${i}`)) {
            form.removeControl(`yearly_${i}`);
        }
    });

    // Clear quarterly controls
    quarters.forEach((_, i) => {
        if (form.contains(`quarter_${i}`)) {
            form.removeControl(`quarter_${i}`);
        }
    });

    // Clear semi-annual controls
    semi_annual.forEach((_, i) => {
        if (form.contains(`semi_annual_${i}`)) {
            form.removeControl(`semi_annual_${i}`);
        }
    });
}

export function addMonthlyControlsSimple(form: any, months: any[]) {
    months.forEach((_, i) => {
        form.addControl(`month_${i}`, new FormControl(0, Validators.min(0)));
    });
}

export function addYearlyControlsSimple(form: any, yearly: any[]) {
    form.addControl(`yearly_0`, new FormControl(0, Validators.min(0)));
}

export function addQuarterlyControlsSimple(form: any, quarters: any[]) {
    quarters.forEach((_, i) => {
        form.addControl(`quarter_${i}`, new FormControl(0, Validators.min(0)));
    });
}

export function addSemiAnnualControlsSimple(form: any, semi_annual: any[]) {
    semi_annual.forEach((_, i) => {
        form.addControl(
            `semi_annual_${i}`,
            new FormControl(0, Validators.min(0))
        );
    });
}

// utils.ts
// general-utils.ts
export function processData(data: any[]): any[] {
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    return data.map((item) => {
        const monthSums = Array(12).fill(0);

        // Process monthly dates
        for (let i = 0; i < 12; i++) {
            const dateKey = `month_${i}_date`;
            const valueKey = `month_${i}`;
            if (item[dateKey] && item[valueKey] !== undefined) {
                const date = new Date(item[dateKey]);
                const month = date.getMonth();
                monthSums[month] += item[valueKey];
            }
        }

        // Process yearly date
        if (item.yearly_0_date && item.yearly_0 !== undefined) {
            const date = new Date(item.yearly_0_date);
            const month = date.getMonth();
            monthSums[month] += item.yearly_0;
        }

        // Process semi-annual dates
        for (let i = 0; i < 2; i++) {
            const dateKey = `semi_annual_${i}_date`;
            const valueKey = `semi_annual_${i}`;
            if (item[dateKey] && item[valueKey] !== undefined) {
                const date = new Date(item[dateKey]);
                const month = date.getMonth();
                monthSums[month] += item[valueKey];
            }
        }

        // Process quarterly dates
        for (let i = 0; i < 4; i++) {
            const dateKey = `quarter_${i}_date`;
            const valueKey = `quarter_${i}`;
            if (item[dateKey] && item[valueKey] !== undefined) {
                const date = new Date(item[dateKey]);
                const month = date.getMonth();
                monthSums[month] += item[valueKey];
            }
        }

        // Add month sums to the item
        item.monthSums = monthNames.map((month, index) => ({
            month,
            sum: monthSums[index],
        }));

        return item;
    });
}

export function formatFrequencyString(frequency: string) {
    if (frequency === 'quarterly') {
        return 'Quarterly';
    } else if (frequency === 'yearly') {
        return 'Yearly';
    } else if (frequency === 'semi_annual') {
        return 'Semi-Annual';
    } else {
        return 'Monthly';
    }
}

export function getObjectiveNames(goal: any): string {
    return (
        goal.objectivesDetails
            ?.filter((o) => o.functional_objective)
            .map((o) => o.functional_objective)
            .join(', ') || ''
    );
}

export function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
}
