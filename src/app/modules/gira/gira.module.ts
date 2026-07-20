import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ExpensesSettingsComponent } from './expenses-settings/expenses-settings.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StatusPipe } from '@fuse/pipes/status.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { ExpensesTypesComponent } from './expenses-settings/expenses-types/expenses-types.component';
import { ExpensesCategoriesComponent } from './expenses-settings/expenses-categories/expenses-categories.component';
import { MatSelectModule } from '@angular/material/select';
import { ExpensesAccountsComponent } from './expenses-settings/expenses-accounts/expenses-accounts.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TaxGroupComponent } from './expenses-settings/tax-group/tax-group.component';
import { HistoricalComponent } from './historical/historical.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CurrencyByCompanyPipe } from '@fuse/pipes/currency-by-company.pipe';
import { DecimalPipe } from '@angular/common';
import { MY_FORMATS } from 'app/interfaces/general/myFormats';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { DividerModule } from 'primeng/divider';
import { ApproveComponent } from './approve/approve.component';
import { AXExpensesComponent } from './ax-expenses/ax-expenses.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PendingAXComponent } from './pending-ax/pending-ax.component';

const expensesSettingsRoutes: Route[] = [
  {
    path: 'app-expenses-settings',
    component: ExpensesSettingsComponent
  }
];

const historicalRoutes: Route[] = [
  {
    path: 'app-historical',
    component: HistoricalComponent
  }
];

const approveRoutes: Route[] = [
  {
    path: 'app-approve',
    component: ApproveComponent
  }
];

const axExpensesRoutes: Route[] = [
  {
    path: 'app-ax-expenses',
    component: AXExpensesComponent
  }
];

const pendingAXRoutes: Route[] = [
  {
    path: 'app-pending-ax',
    component: PendingAXComponent
  }
];

@NgModule({
  providers: [DecimalPipe,
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    provideMomentDateAdapter(MY_FORMATS),
    CurrencyByCompanyPipe,
    ConfirmationService, 
    MessageService
  ],
  declarations: [ExpensesSettingsComponent, StatusPipe, ExpensesTypesComponent, ExpensesCategoriesComponent, ExpensesAccountsComponent, TaxGroupComponent, HistoricalComponent, CurrencyByCompanyPipe, ApproveComponent, AXExpensesComponent, PendingAXComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      ...expensesSettingsRoutes,
      ...historicalRoutes,
      ...approveRoutes,
      ...axExpensesRoutes,
      ...pendingAXRoutes]),
    MatSlideToggleModule,
    MatTabsModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    MatNativeDateModule,

    DialogModule,
    ImageModule,
    DividerModule,
    ConfirmDialogModule,
    ButtonModule,
    ToastModule,
    InputTextareaModule
  ],
  exports: [RouterModule]
})

export class GiraModule { }
