import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CurrencyPipe } from './currency.pipe';
import { CurrencyByCompanyPipe } from './currency-by-company.pipe';

@NgModule({
  declarations: [
    CurrencyPipe,
    CurrencyByCompanyPipe
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
  ]
})
export class AllPipesModule { }
