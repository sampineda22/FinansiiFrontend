import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {}

  transform(amount: any, currency: any): unknown {
    if (currency.replace(' ', '') === 'HNL') {
      return 'L.' + this.decimalPipe.transform(amount, '1.2-2');
    } else if (currency.replace(' ', '') === 'USD') {
      return '$' + this.decimalPipe.transform(amount, '1.2-2');
    } else if (currency.replace(' ', '') === 'GTQ') {
      return 'Q' + this.decimalPipe.transform(amount, '1.2-2');
    } else if (currency.replace(' ', '') === 'CRC') {
      return '₡' + this.decimalPipe.transform(amount, '1.2-2');
    } else {
      // Handle other currencies if needed
      return this.decimalPipe.transform(amount, '1.2-2');
    }
  }

}
