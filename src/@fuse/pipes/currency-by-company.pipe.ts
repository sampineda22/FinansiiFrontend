import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { SharedService } from 'app/shared/shared.service';

@Pipe({
  name: 'currencyByCompany'
})
export class CurrencyByCompanyPipe implements PipeTransform {

constructor(private decimalPipe: DecimalPipe, private _sharedService: SharedService) {}

  transform(amount: any): unknown {
    var companyCode: string = this._sharedService.getCompanyCode();

    if (companyCode.replace(' ', '') === 'IMHN') {
      return 'L.' + this.decimalPipe.transform(amount, '1.2-2');
    } else if (companyCode.replace(' ', '') === 'IMGT') {
      return 'Q' + this.decimalPipe.transform(amount, '1.2-2');
    } else if (companyCode.replace(' ', '') === 'IMCR') {
      return '₡' + this.decimalPipe.transform(amount, '1.2-2');
    } else {
      // Handle other currencies if needed
      return this.decimalPipe.transform(amount, '1.2-2');
    }
  }
}
