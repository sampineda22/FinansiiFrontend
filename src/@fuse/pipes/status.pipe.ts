import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  transform(status: boolean): unknown {
    if (status === true) {
      return 'Activo';
    } else {
      return 'Inactivo';
    }
  }
}
