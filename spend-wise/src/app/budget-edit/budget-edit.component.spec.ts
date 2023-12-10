import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule

import { BudgetEditComponent } from './budget-edit.component';
import { DataService } from '../services/data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('BudgetEditComponent', () => {
  let component: BudgetEditComponent;
  let fixture: ComponentFixture<BudgetEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BudgetEditComponent],
      providers: [DataService],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule] // Add ReactiveFormsModule to the imports

    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});