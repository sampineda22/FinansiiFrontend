import { Pipe, PipeTransform } from '@angular/core';
import { Months } from 'app/enum/months';

@Pipe({
  name: 'monthName'
})
export class MonthNamePipe implements PipeTransform {

  transform(value: number | Months | string | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const monthIndex = typeof value === 'string' ? parseInt(value, 10) : (value as number);

    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return '';
    }

    return Months[monthIndex];
  }

}
