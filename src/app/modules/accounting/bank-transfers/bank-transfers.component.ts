import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { BankStatement } from 'app/interfaces/accounting/bankStatement';
import { BankTransfersService } from './bank-transfers.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { BankConfiguration } from 'app/interfaces/accounting/bankConfiguration';
import { DatePipe } from '@angular/common';
import { SharedService } from 'app/shared/shared.service';
import { BankStatementDetails } from 'app/interfaces/accounting/bankStatementDetails';
import { TranslocoService } from '@ngneat/transloco';
import { BankStatatementState } from 'app/enum/bankStatatementState';

@Component({
  selector: 'app-bank-transfers',
  templateUrl: './bank-transfers.component.html',
  styleUrls: ['./bank-transfers.component.scss']
})
export class BankTransfersComponent implements AfterViewInit {

  bankStatements: BankStatement[] = [];
  bankConfigurations: BankConfiguration[] = [];
  bankStatementDetails: BankStatementDetails[] = [];
  dataSource = new MatTableDataSource<BankStatement>(this.bankStatements);
  dataSourceDetail = new MatTableDataSource<BankStatementDetails>(this.bankStatementDetails);
  displayedColumns: string[] = ['number', 'account', 'description', 'createDateTime', 'status', 'actions'];
  displayedColumnsDetail: string[] = ['number', 'transactionDate', 'transactionCode', 'description', 'amount', 'type', 'reference'];
  itemsPerPage: number = 10;
  pageSize: number[] = [];
  maxDate?: string;
  accountIdSelected?: string = '';
  selectedDate: Date;
  allProcesed: boolean = false;
  companyCode: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _bankTransfersService: BankTransfersService
    , private _sharedService: SharedService
    , public dialog: MatDialog
    , private datePipe: DatePipe
    , private _translocoService: TranslocoService
    , private cdr: ChangeDetectorRef) {

    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this._translocoService.langChanges$.subscribe(() => {
      // When language changes, force a change detection cycle to reload the component
      //this.cdr.detectChanges();
      this.getBanksConfiguration();
    });
  }

  getBanksConfiguration(): void {
    this._bankTransfersService.getBanksConfiguration$(this._sharedService.getCompanyCode()).subscribe(data => {
      if (data.length <= 0) {
        Swal.fire("", "No se encontraron bancos disponibles", "info");
      } else {
        this.bankConfigurations = data
      }
    })
  }

  getBanksStatement(accountId: string): void {
    this.bankStatements = [];
    this.dataSource.data = [];
    this.accountIdSelected = accountId;

    if (this.selectedDate !== undefined) {
      this._bankTransfersService.getStatementsByAccountId$(accountId, this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd'), this._sharedService.getCompanyCode()).subscribe(data => {
        if (data.length <= 0) {
          Swal.fire("", "No se encontraron transacciones para el banco", "info");
        } else {
          this.bankStatements = data
          this.dataSource.data = data;
          this.pageSize = this._sharedService.setPageSize(data.length);
          this.itemsPerPage = this.pageSize[0];

          this.allProcesed = !this.bankStatements.some(x => x.status !== BankStatatementState.Processed);
        }
      })
    }
  }

  accountExists(): void {
    if (this.accountIdSelected !== '') {
      this.getBanksStatement(this.accountIdSelected);
    }
  }

  openDetailDialog(detailTemplate, bankStatementId: number): void {
    this._bankTransfersService.getDetailsByStatement$(bankStatementId).subscribe((data) => {
      this.bankStatementDetails = data;
      this.dataSourceDetail.filter = '';
      this.dataSourceDetail.data = data;

      const dialogRef = this.dialog.open(detailTemplate, {
        width: '900px',
        height: '900px'
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    })
  }

  async exportToAx(): Promise<void> {
    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea exportar a AX?");
    if (response) {
      for (const statement of this.bankStatements) {
        this._bankTransfersService.sendBankStatementServiceAX$(statement.bankStatementId).subscribe(
          (data) => {
            Swal.fire("Diarios Creados", "Se crearón los siguientes diarios exitosamente: " + data.data, "success");
            this.getBanksStatement(this.accountIdSelected)
          },
          (error) => {
            this.dialog.closeAll();
            Swal.fire('Error', error.error.mensaje, 'error');
          })
      }
    }
  }

  async importFile(): Promise<void>{
    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea importar las transacciones?");
    
    if (response) {
      debugger
         this._bankTransfersService.importStatementFromFileByAccount$(this.accountIdSelected, this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd'),this._sharedService.getCompanyCode()).subscribe(
           (data) => {
             debugger
             Swal.fire("Importación Realizada", "Se genero la importación exitosamente", "success");
             this.getBanksStatement(this.accountIdSelected)
           },
           (error) => {
             this.dialog.closeAll();
             Swal.fire('Error', error.error.mensaje, 'error');
           })
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDetail.filter = filterValue.trim().toLowerCase();
  }
}
