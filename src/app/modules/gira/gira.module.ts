import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ExpensesSettingsComponent } from './expenses-settings/expenses-settings.component';
import { SharedModule } from 'app/shared/shared.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { StatusPipe } from '@fuse/pipes/status.pipe';
import {MatTabsModule} from '@angular/material/tabs';
import { ExpensesTypesComponent } from './expenses-settings/expenses-types/expenses-types.component';
import { ExpensesCategoriesComponent } from './expenses-settings/expenses-categories/expenses-categories.component';
import { MatSelectModule } from '@angular/material/select';
import { ExpensesAccountsComponent } from './expenses-settings/expenses-accounts/expenses-accounts.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TaxGroupComponent } from './expenses-settings/tax-group/tax-group.component';
import { UsersComponent } from './expenses-settings/users/users.component';

const expensesSettingsRoutes: Route[] = [
  {
    path: 'app-expenses-settings',
    component: ExpensesSettingsComponent
  }
];

@NgModule({
  declarations: [ExpensesSettingsComponent, StatusPipe, ExpensesTypesComponent, ExpensesCategoriesComponent, ExpensesAccountsComponent, TaxGroupComponent, UsersComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      ...expensesSettingsRoutes]),
      MatSlideToggleModule,
      MatTabsModule,
      MatSelectModule,
      NgxMatSelectSearchModule
  ],
  exports: [RouterModule]
})

export class GiraModule { }
