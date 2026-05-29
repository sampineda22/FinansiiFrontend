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
import { DecimalPipe } from '@angular/common';
import { TransactionTypePipe } from '@fuse/pipes/transaction-type.pipe';
import { ProvidersReportComponent } from './providers-report/providers-report.component';
import { VendPaymentReportComponent } from './vend-payment-report/vend-payment-report.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CertificateDepositComponent } from './certificate-deposit/certificate-deposit.component';
import { AccountingConfigurationComponent } from './accounting-configuration/accounting-configuration.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import { ExceptionCodesComponent } from './accounting-configuration/exception-codes/exception-codes.component';
import { PaymentDatesComponent } from './accounting-configuration/payment-dates/payment-dates.component';

const vendPaymentReportRoutes: Route[] = [
  {
      path     : 'app-vend-payment-report',
      component: VendPaymentReportComponent
  }
];

const bankTransfersRoutes: Route[] = [
  {
      path     : 'app-bank-transfers',
      component: BankTransfersComponent
  }
];

const providersReportRoutes: Route[] = [
  {
      path     : 'app-providers-report',
      component: ProvidersReportComponent
  }
];

const certificateDepositRoutes: Route[] = [
  {
      path     : 'app-certificate-deposit',
      component: CertificateDepositComponent
  }
];

const accountingConfigurationRoutes: Route[] = [
  {
      path     : 'app-accounting-configuration',
      component: AccountingConfigurationComponent
  }
];

@NgModule({
  providers: [DatePipe, DecimalPipe],
  declarations: [BankTransfersComponent, ProvidersReportComponent, CertificateDepositComponent, VendPaymentReportComponent, AccountingConfigurationComponent, TransactionTypePipe, ExceptionCodesComponent, PaymentDatesComponent],
  imports: [
    SharedModule, //Comparte los modulos más comunes
    RouterModule.forChild([
      ...providersReportRoutes,
      ...bankTransfersRoutes,
      ...certificateDepositRoutes,
      ...accountingConfigurationRoutes,
      ...vendPaymentReportRoutes]),
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
    MatChipsModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule
  ],
  exports: [RouterModule, ExceptionCodesComponent, PaymentDatesComponent]
})
export class AccountingModule { }
