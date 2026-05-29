import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CurrencyPipe } from './currency.pipe';
import { MonthNamePipe } from './month-name.pipe';

@NgModule({
  declarations: [
    CurrencyPipe,
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
    MonthNamePipe
  ]
})
export class AllPipesModule { }
