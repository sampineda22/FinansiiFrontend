import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { SharedService } from 'app/shared/shared.service';
import { ExpensesSettingsService } from '../expenses-settings.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ExpenseAccount, ExpenseAccountDto } from 'app/interfaces/gira/expenseAccount';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ExpenseType } from 'app/interfaces/gira/expenseType';
import { ExpenseCategory } from 'app/interfaces/gira/expenseCategory';
import { MainAccountDto } from 'app/interfaces/gira/mainAccountDto';

@Component({
  selector: 'app-expenses-accounts',
  templateUrl: './expenses-accounts.component.html',
  styleUrls: ['./expenses-accounts.component.scss'],
  animations: [],
})

export class ExpensesAccountsComponent implements AfterViewInit, OnDestroy {
  allExpensesAccounts: ExpenseAccountDto[] = [];
  allExpensesTypes: ExpenseType[] = [];
  allExpensesCategories: ExpenseCategory[] = [];
  allMainAccounts: MainAccountDto[] = [];
  searchMainAccounts: MainAccountDto[] = [];
  dataSource = new MatTableDataSource<ExpenseAccountDto>(this.allExpensesAccounts);
  displayedColumns: string[] = ['number', 'accountName', 'expenseTypeName', 'expenseCategoryName', 'actions'];
  filterValue: string = '';
  editExpenseId: number = 0;
  itemsPerPage: number = 10;
  pageSize: number[] = [];

  expensiveAccountForm: FormGroup;
  mainAccountFilterCtrl = new FormControl('');
  buttonText: string = "";

  /* FILTER */
  accountNameUniqueValues: string[] = [];
  filteredAccountNameValues: string[] = [];
  expenseTypeNameUniqueValues: string[] = [];
  filteredExpenseTypeNameValues: string[] = [];
  expenseCategoryNameUniqueValues: string[] = [];
  filteredExpenseCategoryNameValues: string[] = [];

  selectedFilters = {
    accountName: new Set<string>(),
    expenseTypeName: new Set<string>(),
    expenseCategoryName: new Set<string>()
  };
  /**********************/
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _translocoService: TranslocoService
    , private _sharedService: SharedService
    , private _expensesSettingsService: ExpensesSettingsService
    , private _formBuilder: FormBuilder
    , public dialog: MatDialog) { }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.getMainAccounts();
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this._translocoService.langChanges$.subscribe(() => {
      this.getAllExpensesAccounts();
    });

    this.mainAccountFilterCtrl.valueChanges.subscribe(search => {
      const value = (search || '').toLowerCase();

      this.searchMainAccounts = this.allMainAccounts.filter(x =>
        (x.mainAccountId || '').toLowerCase().includes(value) ||
        (x.name || '').toLowerCase().includes(value)
      );
    });
  }

  getAllExpensesAccounts(): void {
    this._expensesSettingsService.getExpensesAccount$(this._sharedService.getCompanyCode()).subscribe
      (
        (data) => {
          try {
            if (data.data.length <= 0) {
              Swal.fire("", "No se encontraron tipos de gastos asociados a los centros de costos", "info");
              this.allExpensesAccounts = [];
            } else {
              this.allExpensesAccounts = data.data;
            }
            this.fillDatasource();
          } catch (error) {
            console.log(error);
            Swal.fire('Error', error.toString(), 'error');
          }
        },
        (error) => {
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
  }

  getCategoriesFilter(idExpenseType: number): void {
    this.allExpensesCategories = (this._expensesSettingsService.getAllExpensesCategories()).filter(x => x.idExpenseType === idExpenseType);
    this.expensiveAccountForm.get('idExpenseCategory').setValue('');
  }

  getMainAccounts(): void {
    this._expensesSettingsService.getMainAccounts$().subscribe
      (
        (data) => {
          try {
            if (data.data.length <= 0) {
              Swal.fire("", "No se encontraron cuentas", "info");
              this.allMainAccounts = [];
              this.searchMainAccounts = [];
            } else {
              this.allMainAccounts = data.data;
              this.searchMainAccounts = [...this.allMainAccounts];
            }
          } catch (error) {
            console.log(error);
            Swal.fire('Error', error.toString(), 'error');
          }
        },
        (error) => {
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
  }

  postPutExpenseAccount(): void {
    if (!this.expensiveAccountForm.invalid) {
      const formValue = this.expensiveAccountForm.value;
      const newExpense: ExpenseAccount = {
        id: this.editExpenseId,
        companyCode: '',
        accountId: formValue.accountId,
        idExpenseType: formValue.idExpenseType,
        idExpenseCategory: formValue.idExpenseCategory
      };

      this._expensesSettingsService.postPutExpenseAccount$(newExpense, this._sharedService.getCompanyCode()).subscribe(
        (data) => {
          try {
            Swal.fire(`${data.mensaje} Realizada`, `La ${data.mensaje.toLowerCase()} se realizó exitosamente`, "success");
            this.getAllExpensesAccounts();
            this._sharedService.closeDialog();
          } catch (error) {
            console.log("Error en metodo postPutExpenseAccount: " + error);
            Swal.fire('Error', error.toString(), 'error');
          }
        },
        (error) => {
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  async deleteExpenseAccount(expense: any): Promise<void> {
    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea eliminar la cuenta?");

    if (response) {
      this._expensesSettingsService.deleteExpenseAccount$(expense.id, this._sharedService.getCompanyCode()).subscribe(
        (data) => {
          try {
            Swal.fire(`Cuenta Eliminada`, `Se eliminó la cuenta exitosamente`, "success");
            this.getAllExpensesAccounts();
          } catch (error) {
            console.log("Error en metodo deleteExpenseAccount: " + error);
            Swal.fire('Error', error.toString(), 'error');
          }
        },
        (error) => {
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  openExpenseAccountDialog(expensesDialogTemplate, element: ExpenseAccountDto): void {
    this.allExpensesTypes = (this._expensesSettingsService.getAllExpensesTypes()).filter(x => x.state);
    this.editExpenseId = element?.id;
    this.buttonText = element == null ? "Crear" : "Editar";

    if (element != null) {
      this.allExpensesCategories = (this._expensesSettingsService.getAllExpensesCategories()).filter(x => x.idExpenseType === element.idExpenseType);
    }

    this.expensiveAccountForm = this._formBuilder.group({
      accountId: new FormControl({ value: element?.accountId, disabled: false }, Validators.required),
      idExpenseType: new FormControl({ value: element?.idExpenseType, disabled: false }, Validators.required),
      idExpenseCategory: new FormControl({ value: element?.idExpenseCategory, disabled: false }, Validators.required)
    });

    const dialogRef = this.dialog.open(expensesDialogTemplate, {
      width: '750px'
    });
  }

  fillDatasource(): void {
    this.dataSource.data = this.allExpensesAccounts;
    this.setUniqueValues()

    this.pageSize = this._sharedService.setPageSize(this.allExpensesAccounts.length);
    this.itemsPerPage = this.pageSize[0];
    this.paginator.pageSize = this.itemsPerPage;
    this.paginator._changePageSize(this.itemsPerPage);
  }

  /* FILTER */
  setUniqueValues(): void {
    this.accountNameUniqueValues = Array.from(new Set(this.allExpensesAccounts.map(item => item.accountName)));
    this.filteredAccountNameValues = [...this.accountNameUniqueValues];
    this.expenseTypeNameUniqueValues = Array.from(new Set(this.allExpensesAccounts.map(item => item.expenseTypeName)));
    this.filteredExpenseTypeNameValues = [...this.expenseTypeNameUniqueValues];
    this.expenseCategoryNameUniqueValues = Array.from(new Set(this.allExpensesAccounts.map(item => item.expenseCategoryName)));
    this.filteredExpenseCategoryNameValues = [...this.expenseCategoryNameUniqueValues];
  }

  clearColumnFilter(column: string): void {
    this.selectedFilters[column].clear();
    this.applyFilters();
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters();

  }

  applyFilters(): void {
    let filteredData = this.allExpensesAccounts;

    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
      }
    });
    this.dataSource.data = filteredData;
  }

  resetFilters(): void {
    this.dataSource.data = this.allExpensesAccounts;
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

  filterAccountNameValues(searchText: string): void {
    this.filteredAccountNameValues = this.accountNameUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterExpenseTypeNameValues(searchText: string): void {
    this.filteredExpenseTypeNameValues = this.accountNameUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterExpenseCategoryNameValues(searchText: string): void {
    this.filteredExpenseCategoryNameValues = this.expenseCategoryNameUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }
}
