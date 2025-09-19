import {
    Component,
    Input,
    ElementRef,
    OnInit,
    ViewChild,
    SimpleChanges,
} from '@angular/core';
import { AuthService } from 'src/app/demo/service/auth.service'; // Import AuthService if needed

@Component({
    selector: 'app-print-table',
    templateUrl: './print-table.component.html',
    styleUrls: ['./print-table.component.scss'],
})
export class PrintTableComponent implements OnInit {
    @ViewChild('printTable') printTableElement: ElementRef;
    // @Input() objectiveDatas: any[] = [];
    @Input() printingOfficeName: string = '';
    @Input() printFlag: boolean = false;
    @Input() printFile: boolean;

    // @Input() isPrintableVisible: boolean = false;
    imageSrc: string; // To store the image source
    isPrintableVisible: boolean = false;
    printingHead: boolean = false;
    objectiveDatas: any;

    preparedByValue: string = '';
    preparedByofficeValue: string = '';
    counterCheckedValue: string = '';
    counterCheckedofficeValue: string = '';
    verifiedByValue: string = '';
    verifiedByofficeValue: string = '';

    subOnjectiveHeaderData: string = '';
    subObjectiveHeaders: string = '';
    reviewedByValue: any;
    reviewedByofficeValue: any;

    constructor(private authService: AuthService) {} // Inject AuthService if needed

    ngOnInit() {
        this.imageSrc = this.authService.domain + '/images/logo.png'; // Get the image source
        // this.authService.domain + '/images/logo.png'; // Get the image source
    }
    /*
      this.parentPrintFile = {
            printFile: true,
            objectData: this.objectiveDatas,
            printingHead: true,
            subObjectiveHeaders: this.subObjectiveHeaders,
            subOnjectiveHeaderData: this.subOnjectiveHeaderData?.department,
            printingOfficeName: this.printingOfficeName,
        };
    */

    ngOnChanges(changes: SimpleChanges) {
        const {
            objectData: data,
            header,
            subObjectiveHeaders,
            printFile: printObjectiveTable,
            subOnjectiveHeaderData,
        } = changes['printFile']?.currentValue;
        console.log(data, header, subObjectiveHeaders, printObjectiveTable);
        this.subOnjectiveHeaderData = subOnjectiveHeaderData;
        this.objectiveDatas = data;
        this.subObjectiveHeaders = subObjectiveHeaders;
        this.printingHead = printObjectiveTable;
    }

    getFrequencyKeys(frequency_monitoring: string) {
        // Replace underscores with spaces
        return frequency_monitoring.replace(/_/g, ' ');
    }

    printPdf() {
        // this.isPrintableVisible = true;
        let print, win;
        print = document.getElementById('print').innerHTML;
        win = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        win.document.open();
        win.document.write(`
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Document</title>
            </head>
            <style>
            * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
          }

          body {
            width: 11in;
            height: 8.5in;
          }

          @media print {
            body {
              padding: unset;
              width: unset;
              height: unset;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: landscape;
            }
            margin: 1.5in 0in 0in 0in;
          }

          table {
            border-collapse: collapse;
            width: 100%;
          }

          table:not(:is(.nested-table)) {
            border-top: 1px solid;
            border-left: 1px solid;
            table-layout: fixed;
          }

          table :is(th, td) {
            padding: 4px 6px;
            border-right: 1px solid;
            border-bottom: 1px solid;
          }

          .nested-table {
            tr {
              td {
            font-weight: 600;
            &[rowspan="4"] {
              border-bottom: 0;
            }
            &:last-child {
              border-right: 0;
            }
              }
              &:last-child {
            td {
              &:last-child {
                border-bottom: 0;
              }
            }
              }
            }
          }

          .logo {
            border-right: 0;
            img {
              width: 80px;
              height: 80px;
              margin-left: auto;
              display: block;
            }
            & + td {
              & > div {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            > h1 {
              font-size: 26px;
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

          tr.font-condensed {
            & > th {
              font-size: 18px;
              padding: 8px 6px;
              &:first-child {
            background-color: #f57e3a;
              }
              &:nth-child(2) {
            background-color: #057a40;
              }
              &:last-child {
            background-color: #efdf10;
              }
            }
            & + tr {
              & > th {
            padding: 8px;
              }
              & + tr {
            & > th {
              padding: 0px 4px;
              font-stretch: condensed;
              font-size: 16px;
            }
            & + tr {
              & > th {
                padding: 2px;
              }
            }
              }
            }
          }

          tbody.data-cells {
            font-stretch: condensed;
            & tr {
              & > td {
            height: 0;
            & > div {
              height: 100%;
              display: flex;
              flex-direction: column;
              gap: 1rem;
              justify-content: space-evenly;
              text-align: center;
              & p {
                font-size: 14px;
              }
            }
              }
            }
          }

          tfoot {
            font-stretch: condensed;
            & tr td {
              padding: 0;
              & > div {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            & > div {
              &:not(:last-child) {
                border-right: 1px solid;
              }
              & > div {
                font-size: 14px;
                padding: 3px 6px;
                &:not(:last-child) {
                  border-bottom: 1px solid;
                }
                &:nth-child(2) {
                  text-align: center;
                  font-size: 16px;
                  padding-top: 32px;
                  font-weight: 600;
                  padding-bottom: 0px;
                }
                &:last-child {
                  text-align: center;
                  font-size: 14px;
                }
              }
            }
              }
            }
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

            </style>
            <body>
              <div id="tobeprinted">
            <table>
              <thead>
                <tr>
                  <th class="p-0" rowspan="4" colspan="10">
                <table class="nested-table">
                  <tr>
                    <td rowspan="4" class="logo">
                      <img src="${this.imageSrc}" alt="CHMSU Logo" />
                    </td>
                    <td rowspan="4">
                      <div>
                    <h1>Carlos Hilado Memorial State University</h1>
                    <h5>Alijis Campus . Binalbagan Campus . Fortune Towne Campus . Talisay Campus</h5>
                    <hr />
                      </div>
                    </td>
                    <td>Revision No.</td>
                  </tr>
                  <tr>
                    <td>Date of Revision</td>
                  </tr>
                  <tr>
                    <td>Date of Effectivity</td>
                  </tr>
                  <tr>
                    <td>Page No.</td>
                  </tr>
                </table>
                  </th>
                  <th>&nbsp;</th>
                </tr>
                <tr>
                  <th>&nbsp;</th>
                </tr>
                <tr>
                  <th>&nbsp;</th>
                </tr>
                <tr>
                  <th class="text-align-end">Page 2</th>
                </tr>
                <tr class="font-condensed">
               <th colspan="7">${
                   this.subOnjectiveHeaderData?.toUpperCase() ||
                   this.printingOfficeName?.toUpperCase()
               }</th>
                  <th colspan="3">QUALITY OBJECTIVES AND ACTION PLAN</th>
                  <th class="text-align-end" colspan="1">CY</th>
                </tr>
                <tr>
                  <th class="border-x-0" colspan="11"></th>
                </tr>
                <tr>
                  <th class="border-x-0" colspan="11"></th>
                </tr>
              </thead>
              <body onload="window.print();window.close()">${print}</body>
              <tfoot>
                <tr>
                  <td colspan="11">
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
                  <div>
                    <div>Approved by:</div>
                    <div>${this.verifiedByValue.toLocaleUpperCase()}</div>
                    <div>${this.verifiedByofficeValue.toLocaleUpperCase()}</div>
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
