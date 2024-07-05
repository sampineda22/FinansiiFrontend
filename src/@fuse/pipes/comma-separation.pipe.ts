import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'commaSeparation'
})
export class CommaSeparationPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {}

  transform(amount: any): unknown {
    if(amount){
      return this.decimalPipe.transform(amount, '1.2-2');
    }else{
      return amount;
    }
  }

}
