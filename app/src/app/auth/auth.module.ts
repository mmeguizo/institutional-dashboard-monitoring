import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { JwtModule } from '@auth0/angular-jwt';

@NgModule({
    imports: [CommonModule, AuthRoutingModule],
    providers: [JwtModule],
})
export class AuthModule {}
