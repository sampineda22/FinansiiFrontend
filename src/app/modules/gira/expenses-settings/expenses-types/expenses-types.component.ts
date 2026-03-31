import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { SharedService } from 'app/shared/shared.service';
import Swal from 'sweetalert2';
import { ExpenseType } from 'app/interfaces/gira/expenseType';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ExpensesSettingsService } from '../expenses-settings.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-expenses-types',
  templateUrl: './expenses-types.component.html',
  styleUrl: './expenses-types.component.scss'
})
export class ExpensesTypesComponent implements AfterViewInit {
  allExpensesTypes: ExpenseType[] = [];
  dataSource = new MatTableDataSource<ExpenseType>(this.allExpensesTypes);
  displayedColumns: string[] = ['number', 'name', 'journal', 'state', 'actions', 'eraseFilters'];
  itemsPerPage: number = 10;
  pageSize: number[] = [];

  typeForm: FormGroup;
  buttonText: string = "";
  newExpenseType: ExpenseType

  /* FILTER */
  nameUniqueValues: string[] = [];
  filteredNameValues: string[] = [];
  journalUniqueValues: string[] = [];
  filteredJournalValues: string[] = [];
  stateUniqueValues: boolean[] = [];
  filteredStateValues: boolean[] = [];

  selectedFilters = {
    name: new Set<string>(),
    journal: new Set<string>(),
    state: new Set<boolean>()
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
      this.getExpensesTypes();
    });
  }

  getExpensesTypes(): void {
    this._expensesSettingsService.getExpensesTypes$(this._sharedService.getCompanyCode()).subscribe(
      data => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron tipos de gastos", "info");
          this.allExpensesTypes = [];
        } else {
          this.allExpensesTypes = data.data;
          this._expensesSettingsService.setAllExpensesTypes(data.data);
        }
        this.fillDatasource();
        //return this.allExpensesTypes;
      })
  }

  postStatus(expenseType: ExpenseType, event: MatSlideToggleChange): void {
    const previousValue = !event.checked;
    expenseType.state = event.checked;

    this._expensesSettingsService.postStatus$(expenseType).subscribe(
      (data) => {
        this.getExpensesTypes();
      },
      (error) => {
        console.log(error);
        expenseType.state = previousValue;
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  createEditExpenseType(): void {
    if (this.typeForm.valid) {
      this.newExpenseType.name = this.typeForm.get('name').value;
      this.newExpenseType.journal = this.typeForm.get('journal').value;
      this._expensesSettingsService.postPutExpenseType$(this.newExpenseType, this._sharedService.getCompanyCode()).subscribe(
        (data) => {
          try {
            Swal.fire(`${data.mensaje} Realizada`, `La ${data.mensaje.toLowerCase()} se realizó exitosamente`, "success");
            this.getExpensesTypes();
            this._sharedService.closeDialog();
          } catch (error) {
            console.log("Error en metodo createEditExpenseType: " + error);
            Swal.fire('Error', error.toString(), 'error');
          }
        },
        (error) => {
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  openTypeDialog(typeDialogTemplate, expenseType: ExpenseType): void {
    this.newExpenseType = expenseType == null ? {} : structuredClone(expenseType);
    this.buttonText = "Crear";

    if (expenseType?.id > 0) {
      this.buttonText = "Actualizar";
    }

    this.typeForm = this._formBuilder.group({
      name: new FormControl({ value: this.newExpenseType?.name, disabled: false }, Validators.required),
      journal: new FormControl({ value: this.newExpenseType?.journal, disabled: false }, Validators.required)
    });

    const dialogRef = this.dialog.open(typeDialogTemplate, {
      width: '700px'
    });
  }

  fillDatasource(): void {
    this.dataSource.data = this.allExpensesTypes;
    this.setUniqueValues()

    this.pageSize = this._sharedService.setPageSize(this.allExpensesTypes.length);
    this.itemsPerPage = this.pageSize[0];
    this.paginator.pageSize = this.itemsPerPage;
    this.paginator._changePageSize(this.itemsPerPage);
  }

  /* FILTER */
  setUniqueValues(): void {
    this.nameUniqueValues = Array.from(new Set(this.allExpensesTypes.map(item => item.name)));
    this.filteredNameValues = [...this.nameUniqueValues];
    this.journalUniqueValues = Array.from(new Set(this.allExpensesTypes.map(item => item.journal)));
    this.filteredJournalValues = [...this.journalUniqueValues];
    this.stateUniqueValues = Array.from(new Set(this.allExpensesTypes.map(item => item.state)));
    this.filteredStateValues = [...this.stateUniqueValues];
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
    let filteredData = this.allExpensesTypes;

    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
      }
    });
    this.dataSource.data = filteredData;
  }

  resetFilters(): void {
    this.dataSource.data = this.allExpensesTypes;
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

  filterJournalValues(searchText: string): void {
    this.filteredJournalValues = this.journalUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterStateValues(searchText: string): void {
    this.filteredStateValues = this.stateUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }
  /**********************/
}
