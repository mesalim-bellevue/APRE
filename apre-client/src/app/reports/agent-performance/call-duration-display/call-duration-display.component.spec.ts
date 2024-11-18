/**
 * Developer: Meher Salim
 * File: call-duration-display.component.spec.ts
 * Description: Unit tests for the CallDurationDisplayComponent
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CallDurationDisplayComponent } from './call-duration-display.component';

describe('CallDurationDisplayComponent', () => {
  let component: CallDurationDisplayComponent;
  let fixture: ComponentFixture<CallDurationDisplayComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CallDurationDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CallDurationDisplayComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure no unmatched requests
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update startDate when onStartDateSelected is called', () => {
    const testDate = new Date('2023-01-01');
    component.onStartDateSelected(testDate);
    expect(component.startDate).toBe('2023-01-01');
  });

  it('should update endDate when onEndDateSelected is called', () => {
    const testDate = new Date('2023-01-31');
    component.onEndDateSelected(testDate);
    expect(component.endDate).toBe('2023-01-31');
  });

  it('should fetch call durations and update chartData and chartLabels', () => {
    component.startDate = '2023-01-01';
    component.endDate = '2023-01-31';
  
    component.fetchCallDurations();
  
    // Ensure URL matches the updated path with `/api`
    const req = httpTestingController.expectOne(
      `/api/reports/agent-performance/call-duration-by-date-range-display?startDate=2023-01-01&endDate=2023-01-31`
    );
  
    expect(req.request.method).toBe('GET');
  
    // Simulate API response
    req.flush([
      { date: '2023-01-01T00:00:00.000Z', duration: 120 },
      { date: '2023-01-02T00:00:00.000Z', duration: 90 },
    ]);
  
    // Verify that chartData and chartLabels are set correctly
    expect(component.chartData).toEqual([120, 90]);
    expect(component.chartLabels).toEqual(['1/1/2023', '1/2/2023']);
  });

  it('should handle errors gracefully when fetching call durations', () => {
    component.startDate = '2023-01-01';
    component.endDate = '2023-01-31';

    component.fetchCallDurations();

    const req = httpTestingController.expectOne(
      `/api/reports/agent-performance/call-duration-by-date-range-display?startDate=2023-01-01&endDate=2023-01-31`
    );

    // Simulate a server error
    req.flush('Error fetching data', { status: 500, statusText: 'Server Error' });

    // Check that no data is set if there was an error
    expect(component.chartData).toEqual([]);
    expect(component.chartLabels).toEqual([]);
  });

  it('should alert if startDate or endDate is not set before fetching data', () => {
    spyOn(window, 'alert');
    component.startDate = '';
    component.endDate = '2023-01-31';

    component.fetchCallDurations();

    expect(window.alert).toHaveBeenCalledWith('Please select both start and end dates.');
  });
});
