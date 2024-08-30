import { NgModule } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { ReceiptBreakdownComponent } from './receipt-breakdown/receipt-breakdown.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

const receiptBreakdownRoutes: Route[] = [
  {
    path : '',
    component: ReceiptBreakdownComponent
  }
]

@NgModule({
  providers: [DatePipe, DecimalPipe],
  declarations: [ReceiptBreakdownComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(receiptBreakdownRoutes),
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class CreditsModule { }
