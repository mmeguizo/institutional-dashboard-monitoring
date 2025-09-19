// src/app/utils/file-utils.ts

export function validateFileType(files: any): boolean {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/gif',
        'image/x-jif',
        'image/x-jiff',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/rtf',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/csv',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'application/zip',
        'image/x-photoshop',
        'image/vnd.dxf',
        'audio/mpeg',
        'audio/wav',
        'audio/aac',
    ];
    for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
            console.log(`Invalid file type: ${file.type}`); // Log the type of any file that fails validation
            return false;
        }
    }

    return true;
}

export function getIcon(name: string) {
    const fileExtension = name.split('.').pop();
    const iconMapping = {
        jpg: 'pi pi-image',
        jpeg: 'pi pi-image',
        png: 'pi pi-image',
        gif: 'pi pi-image',
        svg: 'pi pi-image',
        doc: 'pi pi-file-word',
        docx: 'pi pi-file-word',
        rtf: 'pi pi-file-word',
        pdf: 'pi pi-file-pdf',
        xls: 'pi pi-file-excel',
        xlsx: 'pi pi-file-excel',
        csv: 'pi pi-file-csv',
        ppt: 'pi pi-file-powerpoint',
        pptx: 'pi pi-file-powerpoint',
        txt: 'pi pi-ticket',
        zip: 'pi pi-file-zip',
        psd: 'pi pi-image',
        dxf: 'pi pi-image',
        mp3: 'pi pi-volume-up',
        wav: 'pi pi-volume-up',
        aac: 'pi pi-volume-up',
    };
    return iconMapping[fileExtension] || 'pi pi-file';
}

export function getFrequencyKeys(objectiveFile: any) {
    let firstLetter: any;
    let lastLetter: any;

    const frequencyKeys = Object.keys(objectiveFile).filter((key) =>
        key.includes('file_')
    );
    frequencyKeys.map((key) => {
        firstLetter = key.replace('file_', '').replace(/_/g, ' ');
        lastLetter = parseInt(firstLetter.charAt(firstLetter.length - 1)) + 1;
    });
    return firstLetter.slice(0, -1) + lastLetter;
}
