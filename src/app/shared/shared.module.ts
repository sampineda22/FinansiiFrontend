import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '@fuse/components/card/card.component';
import { LoadingComponent } from '@fuse/components/loading/loading.component';
import { MatDialogComponent } from '@fuse/components/mat-dialog/mat-dialog.component';
import { CurrencyPipe } from '@fuse/pipes/currency.pipe';
import { LoadingService } from '@fuse/components/loading/loading.service';
import { CommaSeparationPipe } from '@fuse/pipes/comma-separation.pipe';
import {MatDividerModule} from '@angular/material/divider';

@NgModule({
    declarations: [CardComponent, LoadingComponent, MatDialogComponent, CurrencyPipe, CommaSeparationPipe],
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
        MatDividerModule
    ],
    providers: [LoadingService]
})
export class SharedModule
{
}
