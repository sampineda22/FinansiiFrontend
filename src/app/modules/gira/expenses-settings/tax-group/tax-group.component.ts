import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { TranslocoService } from '@ngneat/transloco';
import { SharedService } from 'app/shared/shared.service';
import { ExpensesSettingsService } from '../expenses-settings.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TaxGroup } from 'app/interfaces/gira/taxGroup';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tax-group',
  templateUrl: './tax-group.component.html',
  styleUrl: './tax-group.component.scss'
})
export class TaxGroupComponent implements AfterViewInit {
  allTaxGroups: TaxGroup[] = [];
  dataSource = new MatTableDataSource<TaxGroup>(this.allTaxGroups);
  displayedColumns: string[] = ['number', 'grupoImpuestoGravado', 'grupoImpuestoArticuloGravado', 'grupoImpuestoExento', 'grupoImpuestoArticuloExento', 'actions', 'eraseFilters'];
  itemsPerPage: number = 10;
  pageSize: number[] = [];
  taxGroupId: number = 0;

  taxForm: FormGroup;
  buttonText: string = "";

  /* FILTER */
  impGravUniqueValues: string[] = [];
  filteredImpGravValues: string[] = [];
  impArtUniqueValues: string[] = [];
  filteredImpArtValues: string[] = [];
  impExenUniqueValues: string[] = [];
  filteredImpExenValues: string[] = [];
  impArExUniqueValues: string[] = [];
  filteredImpArExValues: string[] = [];

  selectedFilters = {
    grupoImpuestoGravado: new Set<string>(),
    grupoImpuestoArticuloGravado: new Set<string>(),
    grupoImpuestoExento: new Set<string>(),
    grupoImpuestoArticuloExento: new Set<string>()
  };
  /**********************/

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _translocoService: TranslocoService
    , private _sharedService: SharedService
    , private _expensesSettingsService: ExpensesSettingsService
    , private _formBuilder: FormBuilder
    , public dialog: MatDialog
  ) {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this._translocoService.langChanges$.subscribe(() => {
      this.getTaxGroups();
    });
  }

  getTaxGroups(): void {
    this._expensesSettingsService.getTaxGroups$(this._sharedService.getCompanyCode()).subscribe(
      data => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron los grupos de impuestos", "info");
          this.allTaxGroups = [];
        } else {
          this.allTaxGroups = data.data;
        }
        this.fillDatasource();
      })
  }

  openTaxDialog(typeDialogTemplate, taxGroup: TaxGroup): void {
    this.taxGroupId = taxGroup?.id;
    this.buttonText = "Crear";

    if (taxGroup?.id > 0) {
      this.buttonText = "Actualizar";
    }

    this.taxForm = this._formBuilder.group({
      grupoImpuestoGravado: new FormControl({ value: taxGroup?.grupoImpuestoGravado, disabled: false }, Validators.required),
      grupoImpuestoArticuloGravado: new FormControl({ value: taxGroup?.grupoImpuestoArticuloGravado, disabled: false }, Validators.required),
      grupoImpuestoExento: new FormControl({ value: taxGroup?.grupoImpuestoExento, disabled: false }, Validators.required),
      grupoImpuestoArticuloExento: new FormControl({ value: taxGroup?.grupoImpuestoArticuloExento, disabled: false }, Validators.required)
    });

    const dialogRef = this.dialog.open(typeDialogTemplate, {
      width: '700px'
    });
  }

  postTaxGroup(): void {
    if (this.taxForm.valid) {
      var newTax: TaxGroup = {
        id: this.taxGroupId,
        grupoImpuestoGravado: this.taxForm.get('grupoImpuestoGravado').value,
        grupoImpuestoArticuloGravado: this.taxForm.get('grupoImpuestoArticuloGravado').value,
        grupoImpuestoExento: this.taxForm.get('grupoImpuestoExento').value,
        grupoImpuestoArticuloExento: this.taxForm.get('grupoImpuestoArticuloExento').value,
        companyCode: ''
      };

      this._expensesSettingsService.postPutTaxGroup$(newTax, this._sharedService.getCompanyCode()).subscribe(
        (data) => {
          try {
            Swal.fire(`${data.mensaje} Realizada`, `La ${data.mensaje.toLowerCase()} se realizó exitosamente`, "success");
            this.getTaxGroups();
            this._sharedService.closeDialog();
          } catch (error) {
            console.log("Error en metodo postTaxGroup: " + error);
            Swal.fire('Error', error.toString(), 'error');
          }
        },
        (error) => {
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  fillDatasource(): void {
    this.dataSource.data = this.allTaxGroups;
    this.setUniqueValues()

    this.pageSize = this._sharedService.setPageSize(this.allTaxGroups.length);
    this.itemsPerPage = this.pageSize[0];
    this.paginator.pageSize = this.itemsPerPage;
    this.paginator._changePageSize(this.itemsPerPage);
  }

  /* FILTER */
  setUniqueValues(): void {
    this.impGravUniqueValues = Array.from(new Set(this.allTaxGroups.map(item => item.grupoImpuestoGravado)));
    this.filteredImpGravValues = [...this.impGravUniqueValues];
    this.impArtUniqueValues = Array.from(new Set(this.allTaxGroups.map(item => item.grupoImpuestoArticuloGravado)));
    this.filteredImpArtValues = [...this.impArtUniqueValues];
    this.impExenUniqueValues = Array.from(new Set(this.allTaxGroups.map(item => item.grupoImpuestoExento)));
    this.filteredImpExenValues = [...this.impExenUniqueValues];
    this.impArExUniqueValues = Array.from(new Set(this.allTaxGroups.map(item => item.grupoImpuestoArticuloExento)));
    this.filteredImpArExValues = [...this.impArExUniqueValues];
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
    let filteredData = this.allTaxGroups;

    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
      }
    });
    this.dataSource.data = filteredData;
  }

  resetFilters(): void {
    this.dataSource.data = this.allTaxGroups;
    this.displayedColumns.forEach(property => {
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

  filterImpGravValues(searchText: string): void {
    this.filteredImpGravValues = this.impGravUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterImpArtValues(searchText: string): void {
    this.filteredImpArtValues = this.impArtUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterImpExenValues(searchText: string): void {
    this.filteredImpExenValues = this.impExenUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterImpArExValues(searchText: string): void {
    this.filteredImpArExValues = this.impArExUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }
  /**********************/

}
