import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ConnectionService {
    //ngrok development
    // public domain: string = 'https://unduly-enjoyed-parrot.ngrok-free.app/';

    //localhost dev
    public domain: string = 'http://localhost:3002';

    // if deployed online with cpanel hosting
    // public domain: string = 'https://idm-backend.chmsu.edu.ph';

    //render
    // public domain : string = 'https://backend-idm.onrender.com'
    //
    // if deployed online without hosting
    // public domain: string = '';
}
