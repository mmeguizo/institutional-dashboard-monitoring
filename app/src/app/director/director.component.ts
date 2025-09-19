import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../demo/api/product';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ProductService } from '../demo/service/product.service';
// import { ProductService } from '../demo/service/product.service';

@Component({
    templateUrl: './director.component.html',
    selector: 'app-director',
})
export class DirectorComponent implements OnInit, OnDestroy {
    constructor() {}

    ngOnInit() {}

    ngOnDestroy() {}
}
