import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { BankTransfersComponent } from './bank-transfers/bank-transfers.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { SharedModule } from 'app/shared/shared.module';
import { MatNativeDateModule } from '@angular/material/core';
import {MatChipsModule} from '@angular/material/chips';
import { CurrencyPipe } from '@fuse/pipes/currency.pipe';
import { DecimalPipe } from '@angular/common';
import { TransactionTypePipe } from '@fuse/pipes/transaction-type.pipe';

const bankTransfersRoutes: Route[] = [
  {
      path     : '',
      component: BankTransfersComponent
  }
];

@NgModule({
  providers: [DatePipe, DecimalPipe],
  declarations: [BankTransfersComponent, CurrencyPipe, TransactionTypePipe],
  imports: [
    SharedModule,
    RouterModule.forChild(bankTransfersRoutes),
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
    MatNativeDateModule,
    MatChipsModule
  ]
})
export class AccountingModule { }
