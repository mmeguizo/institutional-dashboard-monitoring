import * as _ from 'lodash';
import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { pipe } from 'rxjs';
import { ConnectionService } from '../demo/service/connection.service';
import { marked } from 'marked';
import { MarkdownService } from 'ngx-markdown';

@Pipe({
    name: 'dataFilter',
})
@Injectable()
export class dataFilterPipe implements PipeTransform {
    // case insensitive search
    transform(array: any[], query: string): any {
        if (query) {
            return _.filter(
                array,
                (row) => row.name.indexOf(query.toLowerCase()) > -1
            );
        }
        return array;
    }
    // transform(array: any[], query: string, selector: string): any {
    //     if (query) {
    //         return _.filter(array, row => {
    //             if(Object.prototype.toString.call(query) === '[object Date]'){
    //                 let qd = new Date(query);
    //                 let qday = qd.getDate();
    //                 let qmonth = qd.getMonth();
    //                 let qyear = qd.getFullYear();

    //                 let rd = new Date(row[selector]);
    //                 let rday = rd.getDate();
    //                 let rmonth = rd.getMonth();
    //                 let ryear = rd.getFullYear();

    //                 let queryDate = [qday, qmonth, qyear].join('');
    //                 let rowDate = [rday, rmonth, ryear].join('');

    //                 if(queryDate === rowDate){
    //                     return array;
    //                 }

    //             }else if((row[selector] || '').toString().toLowerCase().indexOf(query) > -1){
    //                 return array;
    //             }
    //         });
    //     }
    //         return array;
    //     }
}

//Sample Usage => (1234.9876 | numberWithCommas : 2)
@Pipe({
    name: 'numberWithCommas',
})
export class NumberWithCommas implements PipeTransform {
    transform(num, places) {
        try {
            if (num > -1) {
                let decimalStr;
                if (String(num).split('.').length == 2) {
                    //console.log(String(num).split('.')[1].length);
                    if (String(num).split('.')[1].length == 1) {
                        decimalStr = num.toString() + '0';
                    } else {
                        decimalStr =
                            num.toString().split('.')[0] +
                            num
                                .toString()
                                .substr(
                                    num.toString().indexOf('.'),
                                    places + 1
                                );
                    }
                } else {
                    decimalStr = num.toString() + '.00';
                }
                const parts = decimalStr.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return parts.join('.');
            }
        } catch (e) {
            console.info('Math Error: ', e.message);
        }
    }
}

@Pipe({
    name: 'sum',
})
export class SumPipe implements PipeTransform {
    transform(items: any[], prop?): any {
        if (prop) {
            return items.reduce((a, b) => a + b[prop], 0);
        } else {
            return items.reduce((a, b) => a + b, 0);
        }
    }
}

@Pipe({
    name: 'isRead',
})
export class IsRead implements PipeTransform {
    transform(items: any[], id): any {
        return items.filter((e) => e.uid === id).length > 0 ? 'read' : 'unread';
    }
}

@Pipe({ name: 'assets' })
export class AssetsPipe implements PipeTransform {
    constructor(private cs: ConnectionService) {}

    transform(src: String, path: String, type: String): string {
        switch (type) {
            case 'html':
                return `${this.cs.domain}/${path}/${src}`;
            case 'css':
                return `url(${this.cs.domain}/${path}/${src})`;
            case 'local-html':
                return `${src}`;
            case 'local-css':
                return `url('${src}')`;
            default:
                // Handle unexpected types (optional, can throw an error or log a warning)
                console.warn(`Unsupported asset type: ${type}`);
                return ''; // Or throw an error
        }
    }

    // transform(src: String, path: String, type: String) {
    //     switch (type) {
    //         case 'html':
    //             return `${this.cs.domain}/${path}/${src}`;
    //         case 'css':
    //             return `url(${this.cs.domain}/${path}/${src})`;
    //         case 'local-html':
    //             return `${src}`;
    //         case 'local-css':
    //             return `url('${src}')`;
    //     }
    // }
}

@Pipe({
    name: 'reversedate',
})
export class ReverseDate implements PipeTransform {
    transform(date: any): any {
        let newd = new Date(date);
        return new Date(newd.setHours(newd.getHours() - 8));
    }
}

@Pipe({
    name: 'stripTags',
})
export class StripTags implements PipeTransform {
    transform(data: any): any {
        data = data.replace(/\n/gi, '<br/>');
        data = data.replace(/\s/gi, '&nbsp;');
        return data;
    }
}

@Pipe({
    name: 'roundOff',
})
export class RoundOff implements PipeTransform {
    transform(data: any): any {
        data = Math.round(data);
        return data;
    }
}
@Pipe({
    name: 'chatmessage',
})
export class ChatMessagePipe implements PipeTransform {
    transform(chat: String): any {
        chat = chat.replace(/\n/gi, '<br/>');
        chat = chat.replace(/\s/gi, '&nbsp;');
        return chat;
    }
}

@Pipe({
    name: 'fileNameOnly',
})
export class FileNameOnly implements PipeTransform {
    transform(file): any {
        file = file.split('-');
        return file[0];
    }
}

@Pipe({
    name: 'peso',
})
export class PesoPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (value) {
            const formattedValue = Number(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            return `₱ ${formattedValue}`;
        } else {
            return '';
        }
    }
}

// @Pipe({
//     name: 'stringToDate',
// })
// export class StringToDatePipe implements PipeTransform {
//     transform(value: string | null | undefined): Date | null {
//         return value ? new Date(value) : null; // Return null for invalid inputs
//     }
// }

@Pipe({ name: 'isoToDate' })
export class StringToDatePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) {
            return ''; // Handle null or empty input
        }
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 (months are 0-indexed) and pad with '0'
        const day = String(date.getDate()).padStart(2, '0');
        return `<span class="math-inline">\{year\}\-</span>{month}-${day}`;
    }
}
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
    async transform(value: string): Promise<string> {
        // Return a promise
        return marked(value); // Await if marked is async
    }
}
