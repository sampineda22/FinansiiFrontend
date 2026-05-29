import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CurrencyPipe } from './currency.pipe';
import { CurrencyByCompanyPipe } from './currency-by-company.pipe';
import { MonthNamePipe } from './month-name.pipe';

@NgModule({
  declarations: [
    CurrencyPipe,
    CurrencyByCompanyPipe
    MonthNamePipe
  ],
  imports     : [
    CommonModule
  ],
  providers   :[
    DecimalPipe
  ],
  exports     : [
    CurrencyPipe,
    CurrencyByCompanyPipe
    MonthNamePipe
  ]
})
export class AllPipesModule { }
