import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { ExpenseDetailsDto } from 'app/interfaces/gira/expenseDetailsDto';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Subject } from 'rxjs';
import { PendingAXService } from './pending-ax.service';
import { SharedService } from 'app/shared/shared.service';
import Swal from 'sweetalert2';
import { HistoricalService } from '../historical/historical.service';
import { CurrencyByCompanyPipe } from '@fuse/pipes/currency-by-company.pipe';
import { LoadingService } from '@fuse/components/loading/loading.service';
import { MatDialog } from '@angular/material/dialog';
import { ApproveService } from '../approve/approve.service';

@Component({
  selector: 'app-pending-ax',
  templateUrl: './pending-ax.component.html',
  styleUrls: ['./pending-ax.component.scss']
})
export class PendingAXComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  details: ExpenseDetailsDto[] = [];
  expenseDetailOpen: ExpenseDetailsDto | null = null;
  dataSource = new MatTableDataSource<ExpenseDetailsDto>(this.details);
  displayedColumns: string[] = [];
  title: string = '';
  subTitle: string = '';
  iconName: string = '';
  serieNum: string = '';
  fuel: string = '';
  previewImageUrl: string = '';
  exemptColumnName: string = '';
  axMessage: string = '';
  displayImageDialog: boolean = false;
  displayMessageDialog: boolean = false;
  detailForm: FormGroup;
  confirmDialog: ConfirmDialog;;
  pipe = new DatePipe('es-HN');
  itemsPerPage: number = 10;
  pageSize: number[] = [];

  //#region Filter
  expenseTypeUniqueValues: string[] = [];
  filteredExpenseTypeValues: string[] = [];
  expenseCategoryUniqueValues: string[] = [];
  filteredExpenseCategoryValues: string[] = [];
  seriesNumUniqueValues: string[] = [];
  filteredSeriesNumValues: string[] = [];
  invoiceIdUniqueValues: string[] = [];
  filteredInvoiceIdValues: string[] = [];
  descriptionUniqueValues: string[] = [];
  filteredDescriptionValues: string[] = [];
  gravadoUniqueValues: number[] = [];
  filteredGravadoValues: number[] = [];
  exemptUniqueValues: number[] = [];
  filteredExemptValues: number[] = [];
  invoiceAmountUniqueValues: number[] = [];
  filteredInvoiceAmountValues: number[] = [];
  nameUniqueValues: string[] = [];
  filteredNameValues: string[] = [];

  selectedFilters = {
    expenseTypeName: new Set<string>(),
    expenseCategoryName: new Set<string>(),
    seriesNum: new Set<string>(),
    invoiceId: new Set<string>(),
    description: new Set<string>(),
    gravadoAmount: new Set<number>(),
    exemptAmount: new Set<number>(),
    invoiceAmount: new Set<number>(),
    name: new Set<string>()
  };
  //#endregion

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(private _translocoService: TranslocoService
    , private _pendingAxService: PendingAXService
    , private _approveService: ApproveService
    , private _sharedService: SharedService
    , private _historicalService: HistoricalService
    , private loadingService: LoadingService
    , private currencyByCompanyPipe: CurrencyByCompanyPipe
    , public dialog: MatDialog
    , private _formBuilder: FormBuilder
  ) {
    this.detailForm = this._formBuilder.group({
      invoiceId: new FormControl({ value: '', disabled: true }),
      invoiceDate: new FormControl({ value: '', disabled: true }),
      seriesNum: new FormControl({ value: '', disabled: true }),
      gravadoAmount: new FormControl({ value: '', disabled: true }),
      exemptAmount: new FormControl({ value: '', disabled: true }),
      invoiceAmount: new FormControl({ value: '', disabled: true }),
      vendAccount: new FormControl({ value: '', disabled: true }),
      fuelType: new FormControl({ value: '', disabled: true }),
      name: new FormControl({ value: '', disabled: true }),
      description: new FormControl({ value: '', disabled: true }),
      creationDate: new FormControl({ value: '', disabled: true }),
    });
  }

  ngOnDestroy(): void {
    if (this.previewImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewImageUrl);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit(): void {
    this._translocoService.langChanges$.subscribe(() => {
      this.details = [];
      this.displayedColumns = this._historicalService.showColumns(true);
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'status');
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'journalNum');

      if (this._sharedService.getCompanyCode() === 'IMGT') {
        this.exemptColumnName = 'Cantidad/Exento';
      } else {
        this.exemptColumnName = 'Importe Exento';
      }

      this.getPendingAXDetails();
    })
  }

  getPendingAXDetails(): void {
    this._pendingAxService.getPendingAX$(this._sharedService.getCompanyCode()).subscribe(
      (data) => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron gastos pendientes por sincronizar en AX", "info");
          this.details = [];
        } else {
          this.details = data.data;
        }
        this.fillDatasource();
      },
      (error) => {
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  putStatus(element: ExpenseDetailsDto = null): void {
    if(element != null){
      this.expenseDetailOpen = element;
    }

    this._approveService.putStatus$(this._sharedService.getCompanyCode(), this.expenseDetailOpen.id, "", this._sharedService.getPersonalCode()).subscribe(
      (data) => {
        try {
          this.displayImageDialog = false;
          //this.getPendingAXDetails();
          Swal.fire({
            title: 'Estado Actualizado',
            text: `${data.mensaje}`,
            icon: 'success',
            customClass: {
              container: 'swal-dialog-front'
            }
          });
        } catch (error) {
          console.log("Error en metodo putStatus: " + error);
          Swal.fire({
            title: 'Error',
            text: error.toString(),
            icon: 'error',
            customClass: {
              container: 'swal-dialog-front'
            }
          });
        }
        this.getPendingAXDetails();
      },
      (error) => {
        this.getPendingAXDetails();
        Swal.fire({
          title: 'Error',
          text: error.error.mensaje,
          icon: 'error',
          customClass: {
            container: 'swal-dialog-front'
          }
        });
      })
  }

  messagePreview(element: ExpenseDetailsDto): void{
    this.displayMessageDialog = true;
    this.axMessage = element.axMessage == '' || element.axMessage == null ? 'Sin mensaje de AX.' : element.axMessage;
  }

  openImagePreview(element: ExpenseDetailsDto): void {
    this.displayImageDialog = true;
    this.expenseDetailOpen = element;
    this.title = element.expenseCategoryName;
    this.subTitle = element.expenseCategoryName;
    this.iconName = element.icon;
    this.serieNum = element.seriesNum;
    this.fuel = element.fuelTypeName || '';
    this.previewImageUrl = '';

    this.loadingService.show();

    this.detailForm.patchValue({
      invoiceId: element.invoiceId,
      invoiceDate: this.pipe.transform(element.invoiceDate, 'dd/MMM/yyyy'),
      seriesNum: element.seriesNum,
      gravadoAmount: this.currencyByCompanyPipe.transform(element.gravadoAmount),
      exemptAmount: this.currencyByCompanyPipe.transform(element.exemptAmount),
      invoiceAmount: this.currencyByCompanyPipe.transform(element.invoiceAmount),
      vendAccount: element.vendAccount,
      fuelType: element.fuelTypeName,
      name: element.personalCode + " - " + element.name,
      description: element.description,
      creationDate: this.pipe.transform(element.creationDate, 'dd/MMM/yyyy'),
    });

    this._historicalService.getImage$(element.id, this._sharedService.getCompanyCode()).subscribe({
      next: (blob) => {
        if (this.previewImageUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(this.previewImageUrl);
        }

        this.previewImageUrl = URL.createObjectURL(blob);
        this.displayImageDialog = true;
        this.loadingService.hide();
      },
      error: async (error) => {
        this.loadingService.hide();
        console.error(error);

        let backendMessage = 'Ocurrió un error al obtener la imagen.';

        if (error?.error instanceof Blob) {
          try {
            const text = await error.error.text();
            const json = JSON.parse(text);
            backendMessage = json?.message || json?.message || backendMessage;
          } catch {
            // si no viene json válido, usa mensaje genérico
          }
        } else if (typeof error?.error === 'object') {
          backendMessage = error?.error?.mensaje || error?.error?.Mensaje || backendMessage;
        } else if (typeof error?.error === 'string') {
          backendMessage = error.error;
        }

        if (error.status === 404) {
          Swal.fire({
            title: 'Imagen no encontrada',
            text: backendMessage,
            icon: 'warning',
            customClass: {
              container: 'swal-dialog-front'
            }
          });
          return;
        }

        Swal.fire({
          title: 'Error',
          text: backendMessage,
          icon: 'error',
          customClass: {
            container: 'swal-dialog-front'
          }
        });
      }
    });
  }

  downloadImage(): void {
    this._historicalService
      .getImage$(this.expenseDetailOpen.id, this._sharedService.getCompanyCode())
      .subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);

          const fileName =
            `${this.expenseDetailOpen.expenseTypeName} - ` +
            `${this.expenseDetailOpen.expenseCategoryName}.jpg`;

          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(objectUrl);
        },
        error: (error) => {
          console.error(error);
          Swal.fire('Error', 'No se pudo descargar la imagen.', 'error');
        }
      });
  }

  //#region SETUP METHODS
  closeDialog() {
    this.dialog.closeAll();
  }

  fillDatasource(): void {
    this.dataSource.data = this.details;
    this.setUniqueValues();

    this.pageSize = this._sharedService.setPageSize(this.details.length);
    this.itemsPerPage = this.pageSize[0];
    if (this.paginator) {
      this.paginator.pageSize = this.itemsPerPage;
      this.paginator._changePageSize(this.itemsPerPage);
    }
  }
  //#endregion

  //#region FILTER METHODS
  setUniqueValues(): void {
    this.expenseTypeUniqueValues = Array.from(new Set(this.details.map(item => item.expenseTypeName).filter(name => name !== undefined)));
    this.filteredExpenseTypeValues = [...this.expenseTypeUniqueValues];
    this.expenseCategoryUniqueValues = Array.from(new Set(this.details.map(item => item.expenseCategoryName).filter(name => name !== undefined)));
    this.filteredExpenseCategoryValues = [...this.expenseCategoryUniqueValues];
    this.seriesNumUniqueValues = Array.from(new Set(this.details.map(item => item.seriesNum).filter(value => value !== undefined)));
    this.filteredSeriesNumValues = [...this.seriesNumUniqueValues];
    this.invoiceIdUniqueValues = Array.from(new Set(this.details.map(item => item.invoiceId)));
    this.filteredInvoiceIdValues = [...this.invoiceIdUniqueValues];
    this.descriptionUniqueValues = Array.from(new Set(this.details.map(item => item.description).filter(desc => desc !== undefined)));
    this.filteredDescriptionValues = [...this.descriptionUniqueValues];
    this.gravadoUniqueValues = Array.from(new Set(this.details.map(item => item.gravadoAmount).filter(v => v !== undefined).map(v => v)));
    this.filteredGravadoValues = [...this.gravadoUniqueValues];
    this.exemptUniqueValues = Array.from(new Set(this.details.map(item => item.exemptAmount).filter(v => v !== undefined).map(v => v)));
    this.filteredExemptValues = [...this.exemptUniqueValues];
    this.invoiceAmountUniqueValues = Array.from(new Set(this.details.map(item => item.invoiceAmount).filter(v => v !== undefined).map(v => v)));
    this.filteredInvoiceAmountValues = [...this.invoiceAmountUniqueValues];
    this.nameUniqueValues = Array.from(new Set(this.details.map(item => item.name).filter(name => name !== undefined)));
    this.filteredNameValues = [...this.nameUniqueValues];
  }

  clearColumnFilter(column: string): void {
    this.selectedFilters[column].clear();
    this.applyFilters();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilters(): void {
    let filteredData = this.details;

    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
      }
    });
    this.dataSource.data = filteredData;
  }

  resetFilters(): void {
    this.dataSource.data = this.details;
    Object.keys(this.selectedFilters).forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        this.selectedFilters[property].clear();
      }
    });
  }

  onFilterChange(column: string, value: string, checked: boolean): void {
    if (checked) {
      this.selectedFilters[column].add(value);
    } else {
      this.selectedFilters[column].delete(value);
    }

    this.applyFilters();
  }

  sortTable(column: keyof ExpenseDetailsDto, direction: 'asc' | 'desc'): void {
    const sortedData = this.dataSource.data.sort((a, b) => {
      let compareA = a[column];
      let compareB = b[column];

      if (compareA == null) compareA = '';
      if (compareB == null) compareB = '';

      if (typeof compareA === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB?.toString().toLowerCase();
      }

      if (direction === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    this.dataSource.data = sortedData;
  }

  filterExpenseTypeValues(searchText: string): void {
    this.filteredExpenseTypeValues = this.expenseTypeUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterExpenseCategoryValues(searchText: string): void {
    this.filteredExpenseCategoryValues = this.expenseCategoryUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterSeriesNumValues(searchText: string): void {
    this.filteredSeriesNumValues = this.seriesNumUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterInvoiceIdValues(searchText: string): void {
    this.filteredInvoiceIdValues = this.invoiceIdUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterDescriptionValues(searchText: string): void {
    this.filteredDescriptionValues = this.descriptionUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterGravadoValues(searchText: string): void {
    this.filteredGravadoValues = this.gravadoUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterExemptValues(searchText: string): void {
    this.filteredExemptValues = this.exemptUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterInvoiceAmountValues(searchText: string): void {
    this.filteredInvoiceAmountValues = this.invoiceAmountUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterNameValues(searchText: string): void {
    this.filteredNameValues = this.nameUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }
  //#endregion
}
