import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../demo/api/product';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ProductService } from '../demo/service/product.service';

@Component({
    templateUrl: './admin.component.html',
    selector: 'app-admin',
})
export class AdminComponent implements OnInit, OnDestroy {
    items!: MenuItem[];

    products!: Product[];

    chartData: any;

    chartOptions: any;

    subscription!: Subscription;

    constructor(
        private productService: ProductService,
        public layoutService: LayoutService
    ) {}

    ngOnInit() {}

    ngOnDestroy() {}
}
