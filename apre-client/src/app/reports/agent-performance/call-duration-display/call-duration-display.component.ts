/** 
 * Developer: Meher Salim
 * File: call-duration-display.component.ts
 * Description: This component displays the call duration data by date range.
 */

import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CalendarComponent } from '../../../shared/calendar/calendar.component';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-call-duration-by-date-range',
  standalone: true,
  imports: [CommonModule, CalendarComponent, ChartComponent, HttpClientModule],
  providers: [DatePipe],
  template: `
    <div class="card">
      <div class="card__header">
        <h1>Display Call Duration By Date Range</h1> <!-- Title of the component -->
      </div>
      <div class="card__body">
        <!-- CalendarComponent displays a calendar for selecting dates -->
        <div class="calendar-form">
          <div class="calendar-form__group">
            <div class="calendar-form__item">
              <label class="calendar-form__label" for="startDate">Start Date: </label>
              <app-calendar (dateSelected)="onStartDateSelected($event)"></app-calendar>
            </div>
            <div class="calendar-form__item">
              <label class="calendar-form__label" for="endDate">End Date: </label>
              <app-calendar (dateSelected)="onEndDateSelected($event)"></app-calendar>
            </div>
          </div>
          <div class="calendar-form__dates">
            <p *ngIf="startDate">Start Date: <span class="calendar-form__date">{{ startDate}}</span></p>
            <p *ngIf="endDate">End Date: <span class="calendar-form__date">{{ endDate}}</span></p>
          </div>
        </div>

        <!-- Submit button triggers the fetchCallDurations method when clicked -->
        <button class="button button--primary" (click)="fetchCallDurations()">Get Data</button>

        <!-- ChartComponent displays a chart for visualizing data -->
        <div class="charts-container" *ngIf="chartData.length > 0">
          <div class="card">
            <app-chart
              [type]="'bar'"
              [label]="'Call Duration by Timeframe'"
              [data]="chartData"
              [labels]="chartLabels">
            </app-chart>
          </div>
        </div>
      </div>
    </div>
    
  `,
  styles: [`
   .card {
      width: 80%;
      margin: 0 auto;
    }
    .card__header {
      text-align: center;
      padding: 20px;
    }
    .card__body {
      padding: 20px;
    }
    .calendar-form {
      display: flex;
      flex-direction: column;
    }
    .calendar-form__item {
      flex: 1;
      padding: 10px;
    }
    .calendar-form__dates {
      width: 50%;
      height: 300px;
    }
  `]
})

export class CallDurationDisplayComponent {
  startDate!: string;
  endDate!: string;
  chartData: number[] = [];
  chartLabels: string[] = [];

  constructor(private http: HttpClient) {}

  onStartDateSelected(date: Date) {
    this.startDate = date.toISOString().split('T')[0];  // Convert to "YYYY-MM-DD" format
  }

  onEndDateSelected(date: Date) {
    this.endDate = date.toISOString().split('T')[0];
  }

  fetchCallDurations() {
    if (!this.startDate || !this.endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    const url = `/api/reports/agent-performance/call-duration-by-date-range-display?startDate=${this.startDate}&endDate=${this.endDate}`;
    this.http.get<any[]>(url).subscribe(
      (data) => {
        this.chartData = data.map((entry: any) => entry.duration);
        this.chartLabels = data.map((entry: any) => new Date(entry.date).toLocaleDateString());
      },
      (error) => console.error('Error fetching call durations:', error)
    );
  }
}
