import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { ReceiptDetailBreakdown } from 'app/interfaces/credits/receiptDetailBreakdown';
import { ReceiptBreakdownService } from './receipt-breakdown.service';
import { SharedService } from 'app/shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { FiscalYear } from 'app/interfaces/credits/fiscalYear';
import { FiscalWeek } from 'app/interfaces/credits/fiscalWeek';
import { SalesAgent } from 'app/interfaces/credits/salesAgent';
import { LoadingService } from '@fuse/components/loading/loading.service';

@Component({
  selector: 'app-receipt-breakdown',
  templateUrl: './receipt-breakdown.component.html',
  styleUrl: './receipt-breakdown.component.scss'
})
export class ReceiptBreakdownComponent implements OnInit, AfterViewInit, OnDestroy {
  receiptDetailBreakdown: ReceiptDetailBreakdown[] = [];
  dataSource = new MatTableDataSource<ReceiptDetailBreakdown>(this.receiptDetailBreakdown);
  displayedColumns: string[] = ['number', 'receiptNumber', 'documentNumber', 'productType', 'date', 'client', 'receiptAmountInCurrency', 'receiptAmount', 'canceledReceiptAmount', 'total'];
  selectedSalesAgent: string = '';
  selectedAgent: string | null = null;
  title: string = '';
  body: string = '';
  itemsPerPage: number = 10;
  pageSize: number[] = [];
  selectedFiscalYear: number | null = null;
  salesAgents?: SalesAgent[] = [];
  fiscalYears: FiscalYear[] = [];
  fiscalWeeks: FiscalWeek[] = [];
  selectedWeek: FiscalWeek = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  protected _onDestroy = new Subject<void>();

  constructor(private _receiptBreakdownService: ReceiptBreakdownService
    , private loadingService: LoadingService
    , private _sharedService: SharedService
    , public dialog: MatDialog
    , private datePipe: DatePipe
    , private _translocoService: TranslocoService
    , private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._translocoService.langChanges$.subscribe(() => {
      // When language changes, force a change detection cycle to reload the component
      //this.cdr.detectChanges()
      // listen for search field value changes
      this.getSalesAgents();
      this.getFiscalYears();
      this.receiptDetailBreakdown = [];
      this.fiscalWeeks = [];
      this.dataSource.data = [];
      this.selectedWeek = null;
      this.selectedFiscalYear = null;
      this.selectedAgent = null;
      this.selectedSalesAgent = '';
    })
  }


  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  getReceiptDetailBreakdown(salesAgentPersonalCode: string): void {
    this.receiptDetailBreakdown = [];
    this.dataSource.data = [];

    this.selectedSalesAgent = salesAgentPersonalCode;

    if (this.selectedWeek != null && this.selectedSalesAgent !== '') {

      this.title = 'Consultando Detalles de Recibos';
      this.body = 'Obteniendo datos. Esto podria tardar unos minutos...';
      this.loadingService.show();

      this._receiptBreakdownService.getReceiptDetailBreakdown$(this.datePipe.transform(this.selectedWeek.startDate, 'yyyy-MM-dd'), this.datePipe.transform(this.selectedWeek.endDate, 'yyyy-MM-dd'), this.selectedSalesAgent, this._sharedService.getCompanyCode()).subscribe(
        (data) => {
          this.loadingService.hide();
          if (data.data.length <= 0) {
            Swal.fire("", "No se encontró información del asesor en las fechas seleccionadas", "info");
          } else {
            this.receiptDetailBreakdown = data.data;
            this.dataSource.data = data.data;
            this.pageSize = this._sharedService.setPageSize(data.data.length);
            this.itemsPerPage = this.pageSize[0];
          }
        }, (error) => {
          this.loadingService.hide();
          Swal.fire('Error', error.error.mensaje, 'error');
        }
      )
    }
  }

  getSalesAgents(): void {
    this.salesAgents = [];
    this._receiptBreakdownService.getSalesAgents$(this._sharedService.getCompanyCode()).subscribe(
      (data) => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron asesores de venta", "info");
        } else {
          this.salesAgents = data.data;
        }
      }, (error) => {
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  getFiscalYears(): void {
    this._receiptBreakdownService.getFiscalYears$().subscribe(
      (data) => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron años disponibles", "info");
        } else {
          this.fiscalYears = data.data;
        }
      }, (error) => {
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  getFiscalWeeks(recId: string): void {
    this.fiscalWeeks = [];
    this.dataSource.data = [];
    this.receiptDetailBreakdown = [];
    this.selectedWeek = null;

    this._receiptBreakdownService.getFiscalWeaks$(recId).subscribe(
      (data) => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron semanas disponibles", "info");
        } else {
          this.fiscalWeeks = data.data;
        }
      }, (error) => {
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  async createReport(): Promise<void> {
    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea generar el reporte?");
    if (response) {
      this.body = 'Creando archivo. Esto podria tardar unos minutos...';
      this.loadingService.show();
      this._receiptBreakdownService.createReport$(this.datePipe.transform(this.selectedWeek.startDate, 'yyyy-MM-dd'), this.datePipe.transform(this.selectedWeek.endDate, 'yyyy-MM-dd'), this.selectedWeek.week, this._sharedService.getCompanyCode(), this.selectedSalesAgent).subscribe(
        (data) => {
          this.loadingService.hide();
          Swal.fire("Archivo Creado", data.data, "success");
        },
        (error) => {
          this.loadingService.hide();
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  salesAgentExists(/*ConsultImports*/): void {
    if (this.selectedSalesAgent !== '' && this.fiscalYears.length > 0 && this.selectedWeek != null) {
      this.getReceiptDetailBreakdown(this.selectedSalesAgent/*, ConsultImports*/);
    }
  }

  getSelectedWeek(week: FiscalWeek/*, ConsultImports*/) {
    this.selectedWeek = week;
    this.salesAgentExists(/*ConsultImports*/);
  }
}
