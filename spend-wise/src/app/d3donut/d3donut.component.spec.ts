import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3donutComponent } from './d3donut.component';
import { DataService } from '../services/data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule


describe('D3donutComponent', () => {
  let component: D3donutComponent;
  let fixture: ComponentFixture<D3donutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [D3donutComponent],
      providers: [DataService],
      imports: [HttpClientTestingModule, RouterTestingModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(D3donutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});