import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'app/shared/shared.module';
import { CompaniesComponent } from './companies.component';



@NgModule({
  declarations: [CompaniesComponent],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    SharedModule
  ],
  exports:[
    CompaniesComponent
  ]
})
export class CompaniesModule { }
