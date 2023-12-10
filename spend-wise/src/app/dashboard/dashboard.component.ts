import { Component, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js';
import { DataService } from '../services/data.service';
import { ErrorService } from '../services/error.service';
import { Budget } from '../services/budget';
import { AuthService } from '../services/auth.service';
import { Expense } from '../services/expense';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'pb-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements AfterViewInit {
  errorMessage = '';
  allBudget: Budget[] = [];
  titles = [];
  budget = [];
  expenses = [];
  colors = [];
  newExpense = [];
  newExpenseTitle = [];
  // Add this property to store the time until the next month
  timeUntilNextMonth: string = '';


  selectedBudget: Budget | null = null;
  selectedBudgetExpenses: Expense[] = [];
  selectedMonth: string = '';

  constructor(public dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    public errorService: ErrorService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService) { }

  ngOnInit(): void {
    // Call resetExpenses() at the start of every month
    this.scheduleMonthlyReset();
  }

  ngAfterViewInit(): void {
    this.dataService.getAllBudgetData().subscribe({
      next: budget => {
        this.allBudget = budget;
        this.populateChartData();
        this.createPieChart();
        this.createRadarChart();
        this.createMixedChart();
      },
      error: err => this.errorMessage = err
    });
  }

  populateChartData(): void {
    for (let i = 0; i < this.allBudget.length; i++) {
      this.titles[i] = this.allBudget[i].title;
      this.budget[i] = this.allBudget[i].budget;
      this.expenses[i] = this.allBudget[i].expenses;
      this.colors[i] = this.allBudget[i].color;
    }
  }

  createPieChart(): void {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const myPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.titles,
        datasets: [
          {
            data: this.budget,
            backgroundColor: this.colors,
          },
        ],
      },
    });
  }

  createRadarChart(): void {
    const canvas = document.getElementById('radar') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const myRadarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: this.titles,
        datasets: [
          {
            label: 'Budget',
            data: this.budget,
            borderColor: '#790149',
            pointBorderColor: this.colors,
            pointRadius: 5,
            backgroundColor: 'rgba(255, 0, 0, 0.1)'
          },
          {
            label: 'Expenses',
            data: this.expenses,
            pointBorderColor: this.colors,
            pointRadius: 5,
            borderColor: '#005Fcc',
            backgroundColor: 'rgba(0, 255, 0, 0.1)'
          },
        ],
      },
      options: {
        scale: {
          ticks: {
            beginAtZero: true,
            display: false
          },
          gridLines: {
            display: false
          }
        },
      }
    });
  }

  createMixedChart(): void {
    const canvas = document.getElementById('mixed') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const myRadarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.titles,
        datasets: [
          {
            label: 'Budget',
            data: this.budget,
            backgroundColor: this.colors,
          },
          {
            label: 'Expenses',
            data: this.expenses,
            borderWidth: 2,
            borderColor: this.colors,
            type: 'bar',
            fill: false,
            pointRadius: 10
          },
        ],
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  viewExpenseDetails(budgetId: number, month: string): void {
    this.dataService.getExpenseDetailsForBudgetAndMonth(budgetId, month).subscribe({
      next: (expenses: Expense[]) => {
        this.selectedBudget = this.allBudget.find(budget => budget.id === budgetId) || null;
        this.selectedBudgetExpenses = expenses;
        this.selectedMonth = month;
      },
      error: err => this.errorMessage = err,
    });
  }

  addExpense(budget: Budget, expense: number, title: string, i: number) {
    budget.expenses = +budget.expenses + +expense;
    const newExpenseDetials = {
      id: null,
      expenseTitle: title,
      value: expense,
      budgetId: budget.id,
      date: new Date()
    };

    this.dataService.insertExpense(newExpenseDetials)
      .subscribe({
        next: () => {
          this.onSaveComplete();
          // Reset the input fields
          this.newExpense[i] = null;
          this.newExpenseTitle[i] = null;
        },
        error: err => this.errorMessage = err
      });

    this.dataService.updateBudget(budget)
      .subscribe({
        next: () => {
          this.onSaveComplete();
          // Reset the input fields
          this.newExpense[i] = null;
          this.newExpenseTitle[i] = null;
        },
        error: err => this.errorMessage = err
      });


    console.log('Add expense clicked', expense, budget.id);
    // Reset the input fields
    this.newExpense[i] = null;
    this.newExpenseTitle[i] = null;
  }


  onSaveComplete(): void {
    this.populateChartData();
    this.createPieChart();
    this.createRadarChart();
    this.createMixedChart();
  }

  scheduleMonthlyReset(): void {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    let timeUntilNextMonth = nextMonth.getTime() - now.getTime();

    // Set the timeUntilNextMonth property to the formatted string
    this.timeUntilNextMonth = this.formatTimeDuration(timeUntilNextMonth);

    // Set an interval to call resetExpenses() at the beginning of every month
    setInterval(() => {

      // Update the time until the next month
      timeUntilNextMonth -= 1000; // Subtract one second
      this.timeUntilNextMonth = this.formatTimeDuration(timeUntilNextMonth);
    }, 1000); // Update every second

    // Set an interval to call resetExpenses() at the beginning of every month
    setInterval(() => {
      this.resetExpenses();
    }, timeUntilNextMonth);
  }

  formatTimeDuration(duration: number): string {
    const days = Math.floor(duration / (24 * 60 * 60 * 1000));
    const hours = Math.floor((duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((duration % (60 * 1000)) / 1000);
    return `${days} D ${hours} Hr ${minutes} Min ${seconds} Sec`;
  }

  resetExpenses() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.allBudget.length; i++) {
      this.allBudget[i].expenses = 0;
      this.dataService.updateBudget(this.allBudget[i])
        .subscribe({
          next: () => this.onSaveComplete(),
          error: err => this.errorMessage = err
        });
    }
  }



  getTotalExpenses(): number {
    return this.selectedBudgetExpenses.reduce((total, expense) => total + expense.value, 0);
  }

  getCurrentMonthName(): string {
    const currentMonthNumber = new Date().getMonth() + 1;
    return this.getMonthName(currentMonthNumber);
  }

  public getMonthName(monthNumber) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Adjust monthNumber to be in the range [0, 11]
    const adjustedMonthNumber = (monthNumber - 1 + 12) % 12;

    return months[adjustedMonthNumber];
  }
}