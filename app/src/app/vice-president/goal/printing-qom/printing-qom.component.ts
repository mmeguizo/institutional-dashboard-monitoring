// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-printing-qom',
// //   standalone: true,
// //   imports: [],
//   templateUrl: './printing-qom.component.html',
//   styleUrl: './printing-qom.component.scss'
// })
// export class PrintingQomComponent {

// }

import {
    Component,
    Input,
    ElementRef,
    OnInit,
    ViewChild,
    AfterViewInit,
    SimpleChanges,
} from '@angular/core';
import { AuthService } from 'src/app/demo/service/auth.service'; // Import AuthService if needed
import { formatDate } from 'src/app/utlis/general-utils';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';

formatDate;
@Component({
    selector: 'app-printing-qom',
    standalone: true,
    imports: [
        DialogModule,
        FormsModule,
        ButtonModule,
        CommonModule,
        InputTextModule,
    ],
    templateUrl: './printing-qom.component.html',
    styleUrl: './printing-qom.component.scss',
})
export class PrintingQomComponent implements OnInit, AfterViewInit {
    @ViewChild('printTable') printTableElement: ElementRef;
    // @Input() objectiveDatas: any[] = [];
    @Input() printingOfficeName: string = '';
    @Input() printFlag: boolean = false;
    @Input() printQOMFile: boolean;

    // @Input() isPrintableVisible: boolean = false;
    imageSrc: string; // To store the image source
    imageSrcOptimized: string; // To store the image source
    imageSrcLogo: string; // To store the image source
    isPrintableVisible: boolean = false;
    printingHead: boolean;
    objectiveDatas: any;
    nameValue: string = '';
    officeValue: string = '';
    subOnjectiveHeaderData: string = '';

    preparedByValue: string = '';
    preparedByofficeValue: string = '';
    counterCheckedValue: string = '';
    counterCheckedofficeValue: string = '';
    verifiedByValue: string = '';
    verifiedByofficeValue: string = '';

    subObjectiveHeaders: string = '';
    reviewedByValue: any;
    reviewedByofficeValue: any;
    date = new Date();
    formattedDate: string;

    constructor(private authService: AuthService) {}

    ngOnChanges(changes: SimpleChanges) {
        const { data, header, printQOMObjectiveTable } =
            changes['printQOMFile']?.currentValue;

        console.log({
            QOMPRINTINGtester: changes['printQOMFile']?.currentValue,
        });

        this.objectiveDatas = data;
        this.subOnjectiveHeaderData = header;
        this.printingHead = printQOMObjectiveTable;
    }

    ngAfterViewInit() {
        this.imageSrc = this.authService.domain + '/images/logo.png'; // Get the image source
        this.imageSrcOptimized =
            this.authService.domain + '/images/chmsu-logo-optimized.png'; // Get the image source
        this.imageSrcLogo = this.authService.domain + '/images/chmsu-logo.png'; // Get the image source
        this.formattedDate = formatDate(this.date);
    }

    ngOnInit() {
        // this.imageSrc = this.authService.domain + '/images/logo.png'; // Get the image source
        // this.imageSrcOptimized =
        //     this.authService.domain + '/images/chmsu-logo-optimized.png'; // Get the image source
        // this.imageSrcLogo = this.authService.domain + '/images/chmsu-logo.png'; // Get the image source
        // this.formattedDate = formatDate(this.date);
    }

    getFrequencyKeys(frequency_monitoring: string) {
        // Replace underscores with spaces
        return frequency_monitoring.replace(/_/g, ' ');
    }

    printPdf() {
        // this.isPrintableVisible = true;
        let print, win;
        print = document.getElementById('printQom').innerHTML;
        win = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        win.document.open();
        win.document.write(`
          <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/print.min.css" />

            <style>

            * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

body {
  /* padding: 0.25in; */
  width: 13in;
  height: 8.5in;
  /* outline: 1px solid; */
}

@media print {
  body {
    padding: unset;
    width: 100%;
    height: 100%;
  }
}

table {
  border-collapse: collapse;
  width: 100%;
}

table:not(:is(.nested-table, .nested-table2)) {
  border-top: 1px solid;
  border-left: 1px solid;
}

table :is(th, td) {
  padding: 1px 4px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.nested-table {
  tr {
    td {
      &[rowspan="4"] {
        border-bottom: 0;
      }
      &[rowspan="3"] {
        border-bottom: 0;
      }
    }
    &:first-child {
      td {
        &:last-child {
          border-right: 0;
          aspect-ratio: 1 / 1;
        }
      }
    }
    &:last-child {
      td {
        border-bottom: 0;
      }
    }
  }
}

.nested-table2 {
  tr {
    th {
      border-color: black;
      border-top: 0;
      border-bottom: 0;
      background-color: lightblue;
      font-weight: normal;
      padding: 5px;
      &:nth-child(1) {
        background-color: darkred;
        color: white;
        font-size: 14px;
        font-weight: 600;
        padding-left: 90px;
      }
      &:nth-child(2) {
        background-color: darkblue;
        color: white;
        font-size: 14px;
        font-weight: 600;
      }
      &:last-child {
        border-right: 0;
      }
    }
  }
}

.logo {
  width: 0;
  img {
    width: 60px;
    height: 60px;
    margin: 3px;
    display: block;
  }
  & + td {
    & > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: start;
      > h1 {
        font-size: 18px;
        margin-left: 6px;
        text-transform: uppercase;
      }
      > h5 {
        color: #064f7c;
      }
      > hr {
        margin-top: 8px;
        width: 80%;
        border: 1px solid;
      }
    }
  }
}

tbody.data-cells {
  font-stretch: condensed;
  & tr {
    & > td {
      height: 50px;
      font-size: 16px;
      text-align: center;
      padding: 1px;
      padding-bottom: 1em;
      &:is(:nth-child(1), :nth-last-child(1), :nth-last-child(2), :nth-last-child(3)) {
        font-weight: 600;
        text-align: start;
        word-break: break-word;
      }
      & > p {
        font-size: 16px;
        &:not(:last-child) {
          margin-bottom: 1em;
        }
      }
    }
  }
}

tfoot {
  & tr td {
    padding: 0;
    & > div {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      & > div {
        &:not(:last-child) {
          border-right: 1px solid;
        }
        & > div {
          font-size: 14px;
          padding: 1px 6px;
          &:not(:last-child) {
            border-bottom: 1px solid;
          }
          &:nth-child(2) {
            text-align: center;
            font-size: 16px;
            padding-top: 1.75em;
            font-weight: 600;
            padding-bottom: 0px;
            font-stretch: condensed;
          }
          &:last-child {
            text-align: center;
            font-size: 14px;
            font-stretch: condensed;
            font-style: italic;
          }
        }
      }
    }
  }
}

.border-0 {
  /* border: 0px; */
}

.p-0 {
  padding: 0px;
}

.text-align-end {
  text-align: end;
}

.border-x-0 {
  border-left: 1px solid white;
  border-right: 1px solid white;
}

.font-condensed {
  font-stretch: condensed;
}

.bold {
  font-weight: 600;
}

.italic {
  font-style: italic;
}
 </style>

  <body>
    <div id="tobeprinted">
      <table>
        <thead>
          <tr>
            <th class="p-0" colspan="17">
              <table class="nested-table">
                <tr>
                  <td rowspan="4" class="logo">
                    <img src="${this.imageSrcOptimized}" alt="CHMSU Logo" />
                  </td>
                  <td rowspan="4">
                    <div>
                      <h1>Quality Objectives and Monitoring</h1>
                    </div>
                  </td>
                  <td class="bold font-condensed" width="105">Document Code:</td>
                  <td align="center" width="140">F.02-PME -CHMSU</td>
                  <td class="italic" align="center" width="100">Status</td>
                  <td rowspan="4" width="85"></td>
                </tr>
                <tr>
                  <td class="bold font-condensed">Revision Number</td>
                  <td align="center">0</td>
                  <td rowspan="3"></td>
                </tr>
                <tr>
                  <td class="bold font-condensed">Date of Effectivity</td>
                  <td align="center">August 19, 2024</td>
                </tr>
                <tr>
                  <td class="bold font-condensed">Page No.</td>
                  <td align="center">Page 1 of 1</td>
                </tr>
              </table>
            </th>
          </tr>
          <tr>
            <th colspan="17" class="p-0">
              <table class="nested-table2">
                <tr>
                  <th align="left" width="38%">${
                      this.subOnjectiveHeaderData?.toUpperCase() ||
                      this.printingOfficeName?.toUpperCase()
                  }</th>
                  <th width="12%">AY or CY</th>
                  <th align="left">Monitoring No.: 1</th>
                  <th align="left">Recency: as of: ${this.formattedDate}</th>
                  <th align="left">Date of Previous Monitoring: N/A</th>
                </tr>
              </table>
            </th>
          </tr>
          <tr>
            <th class="border-x-0" colspan="17"></th>
          </tr>
           </thead>
                 <body onload="window.print();window.close()">${print}</body>
                 <tbody class="data-cells">
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th class="border-x-0" colspan="17"></th>
          </tr>
          <tr>
            <td colspan="17">
              <div>
                  <div>
                    <div>Prepared by:</div>
                    <div>${this.preparedByValue.toLocaleUpperCase()}</div>
                    <div>${this.preparedByofficeValue.toLocaleUpperCase()}</div>
                  </div>
                  <div>
                    <div>Counter Checked by:</div>
                    <div>${this.counterCheckedValue.toLocaleUpperCase()}</div>
                    <div>${this.counterCheckedofficeValue.toLocaleUpperCase()}</div>
                  </div>
                  <div>
                    <div>Reviewed by:</div>
                    <div>${this.reviewedByValue.toLocaleUpperCase()}</div>
                    <div>${this.reviewedByofficeValue.toLocaleUpperCase()}</div>
                  </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </body>
</html>

              `);
        this.isPrintableVisible = true;
        win.document.close();
        this.isPrintableVisible = false;
        this.printingOfficeName = '';
        this.preparedByValue = '';
        this.preparedByofficeValue = '';
        this.counterCheckedValue = '';
        this.counterCheckedofficeValue = '';
        this.verifiedByValue = '';
        this.verifiedByofficeValue = '';
        this.reviewedByValue = '';
        this.reviewedByofficeValue = '';
    }
}
