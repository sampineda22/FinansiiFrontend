import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { ExpenseCategory } from 'app/interfaces/gira/expenseCategory';
import { SharedService } from 'app/shared/shared.service';
import { ExpensesSettingsService } from '../expenses-settings.service';
import Swal from 'sweetalert2';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-expenses-categories',
  templateUrl: './expenses-categories.component.html',
  styleUrl: './expenses-categories.component.scss'
})
export class ExpensesCategoriesComponent implements AfterViewInit {
  allExpensesCategories: ExpenseCategory[] = [];
  allExpenseTypes: ExpenseCategory[] = [];
  dataSource = new MatTableDataSource<ExpenseCategory>(this.allExpensesCategories);
  displayedColumns: string[] = ['number', 'typeName', 'name', 'isInvoiceRequired', 'isDescriptionRequired', 'isImageRequired', 'status', 'vendAccount', 'actions', 'eraseFilters'];
  itemsPerPage: number = 10;
  pageSize: number[] = [];

  categoryForm: FormGroup;
  buttonText: string = "";
  newExpenseCategory: ExpenseCategory

  /*********FILTER*******/
  nameUniqueValues: string[] = [];
  filteredNameValues: string[] = [];
  typeNameUniqueValues: string[] = [];
  filteredTypeNameValues: string[] = [];
  invoiceUniqueValues: boolean[] = [];
  filteredInvoiceValues: boolean[] = [];
  descriptionUniqueValues: boolean[] = [];
  filteredDescriptionValues: boolean[] = [];
  imageUniqueValues: boolean[] = [];
  filteredImageValues: boolean[] = [];
  statusUniqueValues: boolean[] = [];
  filteredStatusValues: boolean[] = [];
  vendAccountUniqueValues: string[] = [];
  filteredVendAccountValues: string[] = [];

  selectedFilters = {
    name: new Set<string>(),
    typeName: new Set<string>(),
    isInvoiceRequired: new Set<boolean>(),
    isDescriptionRequired: new Set<boolean>(),
    isImageRequired: new Set<boolean>(),
    status: new Set<boolean>(),
    vendAccount: new Set<string>()
  };
  /**********************/
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _translocoService: TranslocoService
    , private _expensesSettingsService: ExpensesSettingsService
    , private _sharedService: SharedService
    , private _formBuilder: FormBuilder
    , public dialog: MatDialog
  ) {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this._translocoService.langChanges$.subscribe(() => {
      this.getExpensesCategories();
    });
  }

  getExpensesCategories(): void {
    this._expensesSettingsService.getExpensesCategories$(this._sharedService.getCompanyCode()).subscribe(data => {
      if (data.data.length <= 0) {
        Swal.fire("", "No se encontraron categorías de gastos", "info");
        this.allExpensesCategories = [];
      } else {
        this.allExpensesCategories = data.data;
        this._expensesSettingsService.setAllExpensesCategories(data.data);
      }
      this.fillDatasource();
    })
  }

  postStatus(expenseCategory: ExpenseCategory, event: MatSlideToggleChange): void {
    const previousValue = !event.checked;
    expenseCategory.status = event.checked;

    this._expensesSettingsService.postStatusCategory$(expenseCategory).subscribe(
      (data) => {
        this.getExpensesCategories();
      },
      (error) => {
        console.log(error);
        expenseCategory.status = previousValue;
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  createEditExpenseCategory(): void {
    if (this.categoryForm.valid) {
      Object.assign(this.newExpenseCategory, this.categoryForm.getRawValue());

      this._expensesSettingsService.postPutExpenseCategory$(this.newExpenseCategory, this._sharedService.getCompanyCode()).subscribe(
        (data) => {
          try {
            Swal.fire(`${data.mensaje} Realizada`, `La ${data.mensaje.toLowerCase()} se realizó exitosamente`, "success");
            this.getExpensesCategories();
            this._sharedService.closeDialog();
          } catch (error) {
            console.log("Error en metodo createEditExpenseCategory: " + error);
            Swal.fire('Error', error.toString(), 'error');
          }
        },
        (error) => {
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  openCategoryDialog(categoryDialogTemplate, expenseCategory: ExpenseCategory): void {
    this.allExpenseTypes = (this._expensesSettingsService.getAllExpensesTypes()).filter(x => x.state);
    this.newExpenseCategory = expenseCategory == null ? {} : structuredClone(expenseCategory);
    this.buttonText = "Crear";

    if (expenseCategory?.id > 0) {
      this.buttonText = "Actualizar";
    }

    this.categoryForm = this._formBuilder.group({
      idExpenseType: new FormControl({ value: this.newExpenseCategory?.idExpenseType, disabled: false }, Validators.required),
      name: new FormControl({ value: this.newExpenseCategory?.name, disabled: false }, Validators.required),
      vendAccount: new FormControl({ value: this.newExpenseCategory?.vendAccount, disabled: false }),
      isInvoiceRequired: new FormControl({ value: this.newExpenseCategory?.isInvoiceRequired, disabled: false }),
      isDescriptionRequired: new FormControl({ value: this.newExpenseCategory?.isDescriptionRequired, disabled: false }),
      isImageRequired: new FormControl({ value: this.newExpenseCategory?.isImageRequired, disabled: false })
    });

    const dialogRef = this.dialog.open(categoryDialogTemplate, {
      width: '700px'
    });
  }

  fillDatasource(): void {
    this.dataSource.data = this.allExpensesCategories;
    this.setUniqueValues()

    this.pageSize = this._sharedService.setPageSize(this.allExpensesCategories.length);
    this.itemsPerPage = this.pageSize[0];
    this.paginator.pageSize = this.itemsPerPage;
    this.paginator._changePageSize(this.itemsPerPage);
  }

  /************FILTER************/
  setUniqueValues(): void {
    this.nameUniqueValues = Array.from(new Set(this.allExpensesCategories.map(item => item.name)));
    this.filteredNameValues = [...this.nameUniqueValues];
    this.typeNameUniqueValues = Array.from(new Set(this.allExpensesCategories.map(item => item.expenseType.name)));
    this.filteredTypeNameValues = [...this.typeNameUniqueValues];
    this.invoiceUniqueValues = Array.from(new Set(this.allExpensesCategories.map(item => item.isInvoiceRequired)));
    this.filteredInvoiceValues = [...this.invoiceUniqueValues];
    this.descriptionUniqueValues = Array.from(new Set(this.allExpensesCategories.map(item => item.isDescriptionRequired)));
    this.filteredDescriptionValues = [...this.descriptionUniqueValues];
    this.imageUniqueValues = Array.from(new Set(this.allExpensesCategories.map(item => item.isImageRequired)));
    this.filteredImageValues = [...this.imageUniqueValues];
    this.statusUniqueValues = Array.from(new Set(this.allExpensesCategories.map(item => item.status)));
    this.filteredStatusValues = [...this.statusUniqueValues];
    this.vendAccountUniqueValues = Array.from(new Set(this.allExpensesCategories.map(item => item.vendAccount)));
    this.filteredVendAccountValues = [...this.vendAccountUniqueValues];
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
    let filteredData = this.allExpensesCategories;

    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => {
          let value: any;
          
          // Handle nested properties
          if (property === 'typeName') {
            value = item.expenseType?.name;
          } else {
            value = item[property];
          }
          
          return this.selectedFilters[property].has(value);
        });
      }
    });
    this.dataSource.data = filteredData;
  }

  resetFilters(): void {
    this.dataSource.data = this.allExpensesCategories;
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

  filterNameValues(searchText: string): void {
    this.filteredNameValues = this.nameUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterInvoiceValues(searchText: string): void {
    this.filteredInvoiceValues = this.invoiceUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterDescriptionValues(searchText: string): void {
    this.filteredDescriptionValues = this.descriptionUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterImageValues(searchText: string): void {
    this.filteredImageValues = this.imageUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterStatusValue(searchText: string): void {
    this.filteredStatusValues = this.statusUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterVendAccountValues(searchText: string): void {
    this.filteredVendAccountValues = this.vendAccountUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterTypeNameValues(searchText: string): void {
    this.filteredTypeNameValues = this.typeNameUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  /*****************************/
}
