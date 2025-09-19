import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { ConnectionService } from './connection.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/internal/Observable';
import { MessageService } from 'primeng/api';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class FileService {
    public authToken;
    public options;

    constructor(
        public auth: AuthService,
        public cs: ConnectionService,
        private http: HttpClient,
        private messageService: MessageService
    ) {
        //this.getAllUsers();
    }

    createAuthenticationHeaders() {
        this.loadToken();
        this.options = new HttpHeaders({
            // 'Content-Type': 'application/json',
            Accept: 'image/jpeg',
            authorization: this.authToken,
        });
    }

    loadToken() {
        const token = localStorage.getItem('token');
        this.authToken = token;
    }

    addFile(form, id = null) {
        this.createAuthenticationHeaders();
        return this.http
            .post(this.cs.domain + `/fileupload/addFile/${id}`, form, {
                headers: this.options,
                responseType: 'json',
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }

    addAvatar(data) {
        this.createAuthenticationHeaders();
        return this.http
            .post(this.cs.domain + '/fileupload/addAvatar', data, {
                headers: this.options,
                responseType: 'json',
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }

    deleteFile(data) {
        this.createAuthenticationHeaders();
        return this.http
            .put(this.cs.domain + '/fileupload/deleteFile', data, {
                headers: this.options,
                responseType: 'json',
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }
    deleteFileObjective(data) {
        this.createAuthenticationHeaders();
        return this.http
            .put(this.cs.domain + '/fileupload/deleteFileObjective', data, {
                headers: this.options,
                responseType: 'json',
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }

    getAllFiles(id) {
        this.createAuthenticationHeaders();
        return this.http
            .get(this.cs.domain + `/fileupload/getAllFiles/${id}`, {
                headers: this.options,
                responseType: 'json',
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }

    addObjectiveFiles(data: any) {
        this.createAuthenticationHeaders();
        const formData: FormData = new FormData();

        const { user_id, files, objectiveId, frequencyFileName } = data;

        for (let file of files) {
            formData.append('files', file, file.name);
        }
        formData.append('objectiveId', objectiveId);
        formData.append('frequencyFileName', frequencyFileName);
        console.log('formData', formData);
        return this.http
            .post(
                this.cs.domain + `/fileupload/addObjectiveFiles/${user_id}`,
                formData,
                { headers: this.options, responseType: 'json' }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }

    addMultipleFiles(
        id: string,
        objectiveIDforFile: string,
        files?: any,
        uploadobjective?: any
    ) {
        this.createAuthenticationHeaders();
        const formData: FormData = new FormData();

        for (let file of files) {
            formData.append('files', file, file.name);
        }

        return this.http
            .post(
                this.cs.domain +
                    `/fileupload/addMultipleFiles/${id}/${objectiveIDforFile}/${uploadobjective}`,
                formData,
                { headers: this.options, responseType: 'json' }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }

    getAllFilesFromObjective(id: string, objectId: string) {
        this.createAuthenticationHeaders();
        return this.http
            .get(
                this.cs.domain +
                    `/fileupload/getAllFilesFromObjective/${id}/${objectId}`,
                { headers: this.options, responseType: 'json' }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }
    getAllFilesHistoryFromObjectiveLoad(id: string, objectId: string) {
        this.createAuthenticationHeaders();
        return this.http
            .get(
                this.cs.domain +
                    `/fileupload/getAllFilesHistoryFromObjectiveLoad/${id}/${objectId}`,
                { headers: this.options, responseType: 'json' }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }

    getRoute(endpoint, apiName, data) {
        this.createAuthenticationHeaders();
        if (endpoint == 'put') {
            return this.http
                .put(this.cs.domain + `/fileupload/${apiName}`, data, {
                    headers: this.options,
                })
                .pipe(
                    catchError((error: HttpErrorResponse) => {
                        console.error(
                            `API Error (${error.status}):`,
                            error.error
                        );
                        if (error.status === 401 || error.status === 403) {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'You are unauthorized!',
                            });
                            this.auth.logout();
                        } else if (error.status === 500) {
                            // Internal server error Or Token Expired
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Internal server error Or Token Expired. Please try again later.',
                            });
                        } else if (error.status === 404) {
                            // Not found error
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'The requested resource was not found.',
                            });
                        } else {
                            // Other errors
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: error.error,
                            });
                        }

                        return throwError(() => error);
                    })
                );
        } else if (endpoint == 'post') {
            return this.http
                .post(this.cs.domain + `/fileupload/${apiName}`, data, {
                    headers: this.options,
                })
                .pipe(
                    catchError((error: HttpErrorResponse) => {
                        console.error(
                            `API Error (${error.status}):`,
                            error.error
                        );
                        if (error.status === 401 || error.status === 403) {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'You are unauthorized!',
                            });
                            this.auth.logout();
                        } else if (error.status === 500) {
                            // Internal server error Or Token Expired
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Internal server error Or Token Expired. Please try again later.',
                            });
                        } else if (error.status === 404) {
                            // Not found error
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'The requested resource was not found.',
                            });
                        } else {
                            // Other errors
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: error.error,
                            });
                        }

                        return throwError(() => error);
                    })
                );
        } else {
            return this.http
                .get(this.cs.domain + `/fileupload/${apiName}`, {
                    headers: this.options,
                })
                .pipe(
                    catchError((error: HttpErrorResponse) => {
                        console.error(
                            `API Error (${error.status}):`,
                            error.error
                        );
                        if (error.status === 401 || error.status === 403) {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'You are unauthorized!',
                            });
                            this.auth.logout();
                        } else if (error.status === 500) {
                            // Internal server error Or Token Expired
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Internal server error Or Token Expired. Please try again later.',
                            });
                        } else if (error.status === 404) {
                            // Not found error
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'The requested resource was not found.',
                            });
                        } else {
                            // Other errors
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: error.error,
                            });
                        }

                        return throwError(() => error);
                    })
                );
        }
    }
}
