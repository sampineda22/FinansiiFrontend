import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LoadingService } from '@fuse/components/loading/loading.service';
import { TranslocoService } from '@ngneat/transloco';
import { ProviderReport } from 'app/interfaces/accounting/providerReport';
import { SharedService } from 'app/shared/shared.service';
import { ProvidersReportService } from './providers-report.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-providers-report',
  templateUrl: './providers-report.component.html',
  styleUrl: './providers-report.component.scss'
})
export class ProvidersReportComponent implements AfterViewInit {
  providersReport: ProviderReport[] = [];
  dataSource = new MatTableDataSource<ProviderReport>(this.providersReport);
  displayedColumns: string[] = ['number', 'date', 'provider', 'name', 'group', 'realBalance', 'advance', 'eraseFilters'];
  body: string = '';
  itemsPerPage: number = 10;
  pageSize: number[] = [];

  dateUniqueValues: (string | Date)[] = [];
  providerUniqueValues: string[] = [];
  filteredProviderValues: string[] = [];
  nameUniqueValues: string[] = [];
  filteredNameValues: string[] = [];
  groupUniqueValues: string[] = [];
  filteredGroupValues: string[] = [];
  realBalanceUniqueValues: number[] = [];
  filteredRealBalanceValues: number[] = [];
  advanceUniqueValues: number[] = [];
  filteredAdvanceValues: number[] = [];

  selectedFilters = {
    date: new Set<string|Date>(),
    provider: new Set<string>(),
    name: new Set<string>(),
    group: new Set<string>(),
    realBalance: new Set<number>(),
    advance: new Set<number>()
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _providersReportService: ProvidersReportService
    , private _sharedService: SharedService
    , private loadingService: LoadingService
    , public dialog: MatDialog
    , private datePipe: DatePipe
    , private _translocoService: TranslocoService) {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this._translocoService.langChanges$.subscribe(() => {
      this.providersReport = [];
      this.dataSource.data = [];
      this.itemsPerPage = 10;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.getProvidersReport(input.files[0]);
    }
  }

  onFilterChange(column: string, value: string, checked: boolean): void {
    if (checked) {
      this.selectedFilters[column].add(value);
    } else {
      this.selectedFilters[column].delete(value);
    }

    this.applyFilters();
  }

  applyFilters(): void {
    let filteredData = this.providersReport;

    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
      }
    });
    this.dataSource.data = filteredData;
  }

  sortTable(column: string, direction: 'asc' | 'desc'): void {
    const sortedData = this.dataSource.data.sort((a, b) => {
      let compareA = a[column];
      let compareB = b[column];

      if (typeof compareA === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (direction === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    this.dataSource.data = sortedData;
  }

  getProvidersReport(selectedFile: File): void {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);

      this.body = 'Consultando información...';
      this.loadingService.show();
      this._providersReportService.getProvidersReport$(formData).subscribe(
        (data) => {
          if (data.data.length <= 0) {
            this.loadingService.hide();
            Swal.fire("", "No se pudo obtener la información del reporte. Favor revisar el archivo.", "error");
          } else {
            this.loadingService.hide();
            this.providersReport = data.data;
            this.dataSource.data = this.providersReport;
            this.pageSize = this._sharedService.setPageSize(this.providersReport.length);
            this.itemsPerPage = this.pageSize[0];
            this.paginator.pageSize = this.itemsPerPage;
            this.paginator._changePageSize(this.itemsPerPage);

            this.setUniqueValues();
            Swal.fire("", "Se generó la información exitosamente", "success");
          }
        },
        (error) => {
          this.loadingService.hide();
          Swal.fire('Error', error.error.mensaje, 'error');
        })
      }
    }

  downloadProvidersReport(): void {
    this._providersReportService.downloadProvidersReport$(this.providersReport).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte de Antigüedad de Proveedores.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error: any) => {
        if (error.mensaje) {
          Swal.fire('Error', error.mensaje, 'error');
        } else if (error.error.mensaje) {
          Swal.fire('Error', error.error.mensaje, 'error');
        }else{
          Swal.fire('Error', 'Ocurrió un error', 'error');
        }
      }
    });
  }
  setUniqueValues(): void{
    this.dateUniqueValues = Array.from(new Set(this.providersReport.map(item => item.date)));
    this.providerUniqueValues = Array.from(new Set(this.providersReport.map(item => item.provider)));
    this.filteredProviderValues = [...this.providerUniqueValues];
    this.nameUniqueValues = Array.from(new Set(this.providersReport.map(item => item.name)));
    this.filteredNameValues = [...this.nameUniqueValues];
    this.groupUniqueValues = Array.from(new Set(this.providersReport.map(item => item.group)));
    this.filteredGroupValues = [...this.groupUniqueValues];
    this.realBalanceUniqueValues = Array.from(new Set(this.providersReport.map(item => item.realBalance)));
    this.filteredRealBalanceValues = [...this.realBalanceUniqueValues];
    this.advanceUniqueValues = Array.from(new Set(this.providersReport.map(item => item.advance)));
    this.filteredAdvanceValues = [...this.advanceUniqueValues];
  }

  resetFilters(): void{
    this.dataSource.data = this.providersReport;
    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        this.selectedFilters[property].clear();
      }
    });
  }

  clearColumnFilter(column: string): void {
    this.selectedFilters[column].clear();
    this.applyFilters();
  }

  filterProviderValues(searchText: string): void {
    this.filteredProviderValues = this.providerUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterNameValues(searchText: string): void {
    this.filteredNameValues = this.nameUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterGroupValues(searchText: string): void {
    this.filteredGroupValues = this.groupUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterRealBalanceValues(searchText: string): void {
    this.filteredRealBalanceValues = this.realBalanceUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterAdvanceValues(searchText: string): void {
    this.filteredAdvanceValues = this.advanceUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }
}
