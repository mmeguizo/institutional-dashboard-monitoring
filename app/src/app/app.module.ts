import { NgModule } from '@angular/core';
import {
    HashLocationStrategy,
    LocationStrategy,
    PathLocationStrategy,
} from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
// import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { AuthService } from './demo/service/auth.service';
import { ConnectionService } from './demo/service/connection.service';
import { DepartmentService } from './demo/service/department.service';
import { FileService } from './demo/service/file.service';
import { GoalService } from './demo/service/goal.service';
import { ObjectiveService } from './demo/service/objective.service';
import { UserService } from './demo/service/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { JwtModule } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './guard/auth.guard';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AuthInterceptor } from './auth.interceptor';
import { NotAuthGuard } from './guard/notAuth.guard';
import { NotfoundComponent } from './notfound/notfound.component';
import { CampusService } from './demo/service/campus.service';
import { LogService } from './demo/service/logs.service';
import { RouteService } from './demo/service/route.service';
import { PdfService } from './demo/service/pdf.service';
import { AiService } from './demo/service/ai.service';
import { BranchService } from './demo/service/branch.service';
import { MarkdownModule } from 'ngx-markdown';
import { GoallistService } from './demo/service/goallists.service';
import { BaseService } from './demo/service/base.service';
import { NotificationService } from './demo/service/notification.service';


export function tokenGetter() {
    return localStorage.getItem('access_token');
}

@NgModule({
    declarations: [AppComponent, NotfoundComponent],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        HttpClientModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
            },
        }),
        MarkdownModule.forRoot(),
        SplitButtonModule,
        // BoldReportViewerModule,
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        CountryService,
        CustomerService,
        EventService,
        IconService,
        NodeService,
        PhotoService,
        ProductService,
        AuthService,
        ConnectionService,
        DepartmentService,
        CampusService,
        FileService,
        GoalService,
        ObjectiveService,
        UserService,
        MessageService,
        ConfirmationService,
        AuthGuard,
        NotAuthGuard,
        AuthInterceptor,
        LogService,
        RouteService,
        PdfService,
        BranchService,
        AiService,
        GoallistService,
        NotificationService,
        BaseService,
    ],

    bootstrap: [AppComponent],
})
export class AppModule {}
