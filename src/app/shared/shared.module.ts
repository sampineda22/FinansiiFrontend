import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '@fuse/components/card/card.component';
import { MatDialogComponent } from '@fuse/components/mat-dialog/mat-dialog.component';

@NgModule({
    declarations: [CardComponent, MatDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardComponent,
        MatDialogComponent
    ]
})
export class SharedModule
{
}
