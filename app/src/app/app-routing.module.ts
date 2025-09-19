import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
// import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AuthGuard } from './guard/auth.guard';
import { NotfoundComponent } from './notfound/notfound.component';
// import { DashboardModule } from './demo/components/dashboard/dashboard.module';
@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: 'template',
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import(
                                    './demo/components/dashboard/dashboard.module'
                                ).then((m) => m.DashboardModule),
                        },

                        {
                            path: 'uikit',
                            loadChildren: () =>
                                import(
                                    './demo/components/uikit/uikit.module'
                                ).then((m) => m.UIkitModule),
                        },
                        {
                            path: 'utilities',
                            loadChildren: () =>
                                import(
                                    './demo/components/utilities/utilities.module'
                                ).then((m) => m.UtilitiesModule),
                        },
                        {
                            path: 'documentation',
                            loadChildren: () =>
                                import(
                                    './demo/components/documentation/documentation.module'
                                ).then((m) => m.DocumentationModule),
                        },
                        {
                            path: 'blocks',
                            loadChildren: () =>
                                import(
                                    './demo/components/primeblocks/primeblocks.module'
                                ).then((m) => m.PrimeBlocksModule),
                        },
                        {
                            path: 'pages',
                            loadChildren: () =>
                                import(
                                    './demo/components/pages/pages.module'
                                ).then((m) => m.PagesModule),
                        },
                    ],
                },
                {
                    path: 'login',
                    loadChildren: () =>
                        import('./auth/auth.module').then((m) => m.AuthModule),
                },
                {
                    path: 'admin',
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import('./admin/admin.module').then(
                                    (m) => m.AdminModule
                                ),
                            canActivate: [AuthGuard],
                        },
                    ],
                },
                {
                    path: 'user',
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import('./user/user.module').then(
                                    (m) => m.UserModule
                                ),
                            canActivate: [AuthGuard],
                        },
                    ],
                },
                {
                    path: 'director',
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import('./director/director.module').then(
                                    (m) => m.DirectorModule
                                ),
                            canActivate: [AuthGuard],
                        },
                    ],
                },
                {
                    path: 'vice-president',
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import(
                                    './vice-president/vice-president.module'
                                ).then((m) => m.VicePresidentModule),
                            canActivate: [AuthGuard],
                        },
                    ],
                },
                {
                    path: 'office-head',
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import('./office-head/office-head.module').then(
                                    (m) => m.OfficeHeadModule
                                ),
                            canActivate: [AuthGuard],
                        },
                    ],
                },
                {
                    path: 'landing',
                    loadChildren: () =>
                        import('./demo/components/landing/landing.module').then(
                            (m) => m.LandingModule
                        ),
                },
                { path: 'notfound', component: NotfoundComponent },
                {
                    path: '',
                    redirectTo: 'login',
                    pathMatch: 'full',
                },
                { path: '**', redirectTo: 'notfound' },
            ],
            {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload',
            }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
