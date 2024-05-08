import { Pipe, PipeTransform } from '@angular/core';
import { TransactionType } from 'app/enum/transactionType';

@Pipe({
  name: 'transactionType'
})
export class TransactionTypePipe implements PipeTransform {

  transform(transactionType: any): unknown {
    if (transactionType === TransactionType.Debit) {
      return 'Débito';
    } else if (transactionType === TransactionType.Credit) {
      return 'Crédito';
    } else {
      return 'Desconocido';
    }
  }

}
