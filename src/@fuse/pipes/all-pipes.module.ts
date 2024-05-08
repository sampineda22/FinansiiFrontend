import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CurrencyPipe } from './currency.pipe';

@NgModule({
  declarations: [
    CurrencyPipe
  ],
  imports     : [
    CommonModule
  ],
  providers   :[
    DecimalPipe
  ],
  exports     : [
    CurrencyPipe
  ]
})
export class AllPipesModule { }
