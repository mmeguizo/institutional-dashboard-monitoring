import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../demo/service/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    role: string;

    constructor(
        public layoutService: LayoutService,
        private auth: AuthService,
        private router: Router
    ) {}

    ngOnInit() {



        const currentUrl = this.router.url;

    // Check if it's a template/demo page
    const isTemplateRoute = currentUrl.startsWith('/template') || currentUrl.startsWith('/uikit') || currentUrl.startsWith('/pages') ||currentUrl.startsWith('/auth');

    if (isTemplateRoute) {
        this.model = [
            {
                label: 'Home',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/template'],
                    },
                ],
            },
            {
                label: 'UI Components',
                items: [
                    {
                        label: 'Form Layout',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink: ['/template/uikit/formlayout'],
                    },
                    {
                        label: 'Input',
                        icon: 'pi pi-fw pi-check-square',
                        routerLink: ['/template/uikit/input'],
                    },
                    {
                        label: 'Float Label',
                        icon: 'pi pi-fw pi-bookmark',
                        routerLink: ['/template/uikit/floatlabel'],
                    },
                    {
                        label: 'Invalid State',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/template/uikit/invalidstate'],
                    },
                    {
                        label: 'Button',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/template/uikit/button'],
                    },
                    {
                        label: 'Table',
                        icon: 'pi pi-fw pi-table',
                        routerLink: ['/template/uikit/table'],
                    },
                    {
                        label: 'List',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/template/uikit/list'],
                    },
                    {
                        label: 'Tree',
                        icon: 'pi pi-fw pi-share-alt',
                        routerLink: ['/template/uikit/tree'],
                    },
                    {
                        label: 'Panel',
                        icon: 'pi pi-fw pi-tablet',
                        routerLink: ['/template/uikit/panel'],
                    },
                    {
                        label: 'Overlay',
                        icon: 'pi pi-fw pi-clone',
                        routerLink: ['/template/uikit/overlay'],
                    },
                    {
                        label: 'Media',
                        icon: 'pi pi-fw pi-image',
                        routerLink: ['/template/uikit/media'],
                    },
                    {
                        label: 'Menu',
                        icon: 'pi pi-fw pi-bars',
                        routerLink: ['/template/uikit/menu'],
                        routerLinkActiveOptions: {
                            paths: 'subset',
                            queryParams: 'ignored',
                            matrixParams: 'ignored',
                            fragment: 'ignored',
                        },
                    },
                    {
                        label: 'Message',
                        icon: 'pi pi-fw pi-comment',
                        routerLink: ['/template/uikit/message'],
                    },
                    {
                        label: 'File',
                        icon: 'pi pi-fw pi-file',
                        routerLink: ['/template/uikit/file'],
                    },
                    {
                        label: 'Chart',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/template/uikit/charts'],
                    },
                    {
                        label: 'Misc',
                        icon: 'pi pi-fw pi-circle',
                        routerLink: ['/template/uikit/misc'],
                    },
                ],
            },
            {
                label: 'Prime Blocks',
                items: [
                    {
                        label: 'Free Blocks',
                        icon: 'pi pi-fw pi-eye',
                        routerLink: ['/template/blocks'],
                        badge: 'NEW',
                    },
                    {
                        label: 'All Blocks',
                        icon: 'pi pi-fw pi-globe',
                        url: ['https://www.primefaces.org/primeblocks-ng'],
                        target: '_blank',
                    },
                ],
            },
            {
                label: 'Utilities',
                items: [
                    {
                        label: 'PrimeIcons',
                        icon: 'pi pi-fw pi-prime',
                        routerLink: ['/template/utilities/icons'],
                    },
                    {
                        label: 'PrimeFlex',
                        icon: 'pi pi-fw pi-desktop',
                        url: ['https://www.primefaces.org/primeflex/'],
                        target: '_blank',
                    },
                ],
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing'],
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/template/auth/login'],
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/template/auth/error'],
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/template/auth/access'],
                            },
                        ],
                    },
                    {
                        label: 'Crud',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/template/pages/crud'],
                    },
                    {
                        label: 'Timeline',
                        icon: 'pi pi-fw pi-calendar',
                        routerLink: ['/template/pages/timeline'],
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/template/notfound'],
                    },
                    {
                        label: 'Empty',
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/template/pages/empty'],
                    },
                ],
            },
            {
                label: 'Hierarchy',
                items: [
                    {
                        label: 'Submenu 1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 1.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 1.1.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                    {
                                        label: 'Submenu 1.1.2',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                    {
                                        label: 'Submenu 1.1.3',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                ],
                            },
                            {
                                label: 'Submenu 1.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 1.2.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        label: 'Submenu 2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 2.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 2.1.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                    {
                                        label: 'Submenu 2.1.2',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                ],
                            },
                            {
                                label: 'Submenu 2.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 2.2.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Get Started',
                items: [
                    {
                        label: 'Documentation',
                        icon: 'pi pi-fw pi-question',
                        routerLink: ['/template/documentation'],
                    },
                    {
                        label: 'View Source',
                        icon: 'pi pi-fw pi-search',
                        url: ['https://github.com/primefaces/sakai-ng'],
                        target: '_blank',
                    },
                ],
            },
        ];
        return; // Stop here so we don't load the role-based menu
    }


        this.role = this.auth.getUserRole();
        //custom menu
        if (this.role === 'admin') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/admin/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Departments',
                    items: [
                        {
                            label: 'Departments List',
                            icon: 'pi pi-building',
                            routerLink: ['/admin/departments'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: ['/admin/goals/dashboard'],
                                },
                                {
                                    label: 'Goals Tables',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/admin/goals'],
                                },
                                // {
                                //     label: 'Objectives Tables',
                                //     icon: 'pi pi-flag',
                                //     routerLink: ['/admin/goals/objectives'],
                                // },
                                // {
                                //     label: 'Calendar',
                                //     icon: 'pi pi-calendar-plus',
                                //     routerLink: ['/admin/goals/calendar'],
                                // },
                                // {
                                //     label: 'Charts',
                                //     icon: 'pi pi-chart-line',
                                //     routerLink: ['/admin/goals/reporting'],
                                // },
                            ],
                        },
                    ],
                },
                {
                    label: 'Manager',
                    items: [
                        {
                            label: 'Goal',
                            icon: 'pi pi-sitemap',
                            routerLink: ['/admin/goal-management'],
                        },
                    ],
                },
                {
                    label: 'Users',
                    items: [
                        {
                            label: 'Users List',
                            icon: 'pi pi-table',
                            routerLink: ['/admin/users'],
                        },
                    ],
                },
                // {
                //     label: 'Logs',
                //     items: [
                //         {
                //             label: 'Activity',
                //             icon: 'pi pi-server',
                //             routerLink: ['/admin/logs'],
                //         },
                //     ],
                // },
                // {
                //     label: 'Ai Helper',
                //     items: [
                //         {
                //             label: 'Gemini',
                //             icon: 'pi pi-google',
                //             routerLink: ['/admin/ai'],
                //         },
                //     ],
                // },
            ];
        }

        if (this.role === 'office-head') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/office-head/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            // routerLink: ['/office-head/goal'],
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: ['/office-head/goal/dashboard'],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/office-head/goal'],
                                },
                                // {
                                //     label: 'Objectives',
                                //     icon: 'pi pi-flag',
                                //     routerLink: [
                                //         '/office-head/goals/objectives',
                                //     ],
                                // },
                                // {
                                //     label: 'Calendar',
                                //     icon: 'pi pi-calendar-plus',
                                //     routerLink: ['/office-head/goals/calendar'],
                                // },
                            ],
                        },
                    ],
                },
                // {
                //     label: 'Ai Helper',
                //     items: [
                //         {
                //             label: 'Gemini',
                //             icon: 'pi pi-google',
                //             routerLink: ['/office-head/ai'],
                //         },
                //     ],
                // },
            ];
        }

        if (this.role === 'vice-president') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/vice-president/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            // routerLink: ['/office-head/goal'],
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: [
                                        '/vice-president/goal/dashboard',
                                    ],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/vice-president/goal'],
                                },
                                // {
                                //     label: 'Objectives',
                                //     icon: 'pi pi-flag',
                                //     routerLink: [
                                //         '/office-head/goals/objectives',
                                //     ],
                                // },
                                // {
                                //     label: 'Calendar',
                                //     icon: 'pi pi-calendar-plus',
                                //     routerLink: ['/office-head/goals/calendar'],
                                // },
                            ],
                        },
                    ],
                },
                // {
                //     label: 'Ai Helper',
                //     items: [
                //         {
                //             label: 'Gemini',
                //             icon: 'pi pi-google',
                //             routerLink: ['/vice-president/ai'],
                //         },
                //     ],
                // },
            ];
        }

        if (this.role === 'director') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/director/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            // routerLink: ['/office-head/goal'],
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: ['/director/goals/dashboard'],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/director/goals'],
                                },
                                // {
                                //     label: 'Objectives',
                                //     icon: 'pi pi-flag',
                                //     routerLink: [
                                //         '/office-head/goals/objectives',
                                //     ],
                                // },
                                // {
                                //     label: 'Calendar',
                                //     icon: 'pi pi-calendar-plus',
                                //     routerLink: ['/office-head/goals/calendar'],
                                // },
                            ],
                        },
                    ],
                },
                // {
                //     label: 'Ai Helper',
                //     items: [
                //         {
                //             label: 'Gemini',
                //             icon: 'pi pi-google',
                //             routerLink: ['/director/ai'],
                //         },
                //     ],
                // },
            ];
        }

        if (this.role === 'vice-president') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/vice-president/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            // routerLink: ['/office-head/goal'],
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: [
                                        '/vice-president/goals/dashboard',
                                    ],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/vice-president/goals'],
                                },
                                // {
                                //     label: 'Objectives',
                                //     icon: 'pi pi-flag',
                                //     routerLink: [
                                //         '/office-head/goals/objectives',
                                //     ],
                                // },
                                // {
                                //     label: 'Calendar',
                                //     icon: 'pi pi-calendar-plus',
                                //     routerLink: ['/office-head/goals/calendar'],
                                // },
                            ],
                        },
                    ],
                },
                // {
                //     label: 'Ai Helper',
                //     items: [
                //         {
                //             label: 'Gemini',
                //             icon: 'pi pi-google',
                //             routerLink: ['/vice-president/ai'],
                //         },
                //     ],
                // },
            ];
        }

        if (this.role === 'user') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/user/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: ['/user/goals/dashboard'],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/user/goals'],
                                },
                                {
                                    label: 'Objectives',
                                    icon: 'pi pi-flag',
                                    routerLink: ['/user/goals/objectives'],
                                },
                                {
                                    label: 'Calendar',
                                    icon: 'pi pi-calendar-plus',
                                    routerLink: ['/user/goals/calendar'],
                                },
                            ],
                        },
                    ],
                },
                // {
                //     label: 'Ai Helper',
                //     items: [
                //         {
                //             label: 'Gemini',
                //             icon: 'pi pi-google',
                //             routerLink: ['/user/ai'],
                //         },
                //     ],
                // },
            ];
        }
    }
}
