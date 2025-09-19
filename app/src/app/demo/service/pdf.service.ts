import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cloneDeep } from 'lodash';
@Injectable({
    providedIn: 'root', // Make it available application-wide
})
export class PdfService {
    generatePDFObjectiveGoal(
        data: any[],
        fileName: string = 'action-plans.pdf'
    ) {
        const doc = new jsPDF('landscape');
        // autoTable(doc, { html: '#my-table' });
        const tableData = cloneDeep(data).map((item) => [
            item.functional_objective,
            item.performance_indicator,
            item.target,
            item.formula,
            item.programs,
            item.responsible_persons,
            item.clients,
            (item.timetable =
                formatDate(item.timetable[0]) +
                ' - ' +
                formatDate(item.timetable[1])),
            item.frequency_monitoring,
            item.complete ? 'Yes' : 'No',
            item.data_source,
            item.budget.toLocaleString(),
        ]);
        const headers = [
            'Functional Objective',
            'Performance Indicator',
            'Target',
            'Formula',
            'Programs',
            'Responsible Persons',
            'Clients',
            'Timetable',
            'Frequency Monitoring',
            'Complete',
            'Data Source',
            'Budget',
        ];

        autoTable(doc, {
            head: [headers],
            body: tableData,
        });
        doc.save(fileName);
    }
}

function formatDate(dateString: string): string {
    const date: Date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new TypeError('Invalid Date object');
    }
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
}
