import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '@fuse/components/card/card.component';
import { LoadingComponent } from '@fuse/components/loading/loading.component';
import { MatDialogComponent } from '@fuse/components/mat-dialog/mat-dialog.component';
import { CurrencyPipe } from '@fuse/pipes/currency.pipe';
import { MonthNamePipe } from '@fuse/pipes/month-name.pipe';
import { LoadingService } from '@fuse/components/loading/loading.service';
import { CommaSeparationPipe } from '@fuse/pipes/comma-separation.pipe';
import {MatDividerModule} from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [CardComponent, LoadingComponent, MatDialogComponent, CurrencyPipe, CommaSeparationPipe, MonthNamePipe],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDividerModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardComponent,
        CardComponent,
        MatDialogComponent,
        CurrencyPipe,
        LoadingComponent,
        CommaSeparationPipe,
        MatDividerModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatButtonModule,
        MonthNamePipe
    ],
    providers: [LoadingService]
})
export class SharedModule
{
}
