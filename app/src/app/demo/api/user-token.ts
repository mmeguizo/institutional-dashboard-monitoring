import { Observable } from 'rxjs';

export interface UserToken {
    deleted: boolean;
    email: string;
    id: string;
    profile_pic: string;
    role: string;
    status: string;
    username: string;
    campus: string;
    department: string;
    exp: number;
    iat: number;
}
