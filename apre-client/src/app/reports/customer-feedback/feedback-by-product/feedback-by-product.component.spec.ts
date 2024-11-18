import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FeedbackByProductComponent } from './feedback-by-product.component';
import { By } from '@angular/platform-browser';

interface MockFeedbackResponse {
  feedbacks: { customer: string; product: string; feedback: string; sentiment: string }[];
}

describe('FeedbackByProductComponent', () => {
  let component: FeedbackByProductComponent;
  let fixture: any;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, FeedbackByProductComponent], // Import the standalone component here
    }).compileComponents();
  
    fixture = TestBed.createComponent(FeedbackByProductComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the form and clear data on resetForm()', () => {
    component.feedbackForm.setValue({ product: 'Test Product' });
    component.feedbackData = [
      {
        customer: 'John Doe',
        product: 'Test Product',
        feedback: 'Great product!',
        sentiment: 'Positive',
      },
    ];
    component.errorMessage = 'An error occurred.';
  
    component.resetForm();
  
    expect(component.feedbackForm.value.product).toBeNull(); // Expect null
    expect(component.feedbackData.length).toBe(0);
    expect(component.errorMessage).toBeNull();
  });

  it('should display an error message if product name is not entered', () => {
    component.feedbackForm.setValue({ product: '' });
    component.fetchFeedback();

    expect(component.errorMessage).toBe('Please enter a product name.');
  });

  it('should make an API call and populate feedbackData on valid product name', () => {
    const mockResponse: MockFeedbackResponse = {
      feedbacks: [
        {
          customer: 'Alice',
          product: 'Test Product',
          feedback: 'Excellent!',
          sentiment: 'Positive',
        },
      ],
    };

    component.feedbackForm.setValue({ product: 'Test Product' });
    component.fetchFeedback();

    const req = httpMock.expectOne('/api/reports/customer-feedback/product/Test%20Product');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.feedbackData).toEqual(mockResponse.feedbacks);
    expect(component.errorMessage).toBeNull();
  });

  it('should handle API error and display an error message', () => {
    component.feedbackForm.setValue({ product: 'Test Product' });
    component.fetchFeedback();
  
    const encodedProduct = encodeURIComponent('Test Product');
    const req = httpMock.expectOne(`/api/reports/customer-feedback/product/${encodedProduct}`);
    
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  
    expect(component.feedbackData.length).toBe(0);
    expect(component.errorMessage).toBe('Failed to retrieve feedback data.');
  });

  it('should display no data message when feedbackData is empty', () => {
    component.feedbackData = [];
    fixture.detectChanges();

    const noDataMessage = fixture.debugElement.query(By.css('.no-data'));
    expect(noDataMessage.nativeElement.textContent).toContain('No feedback available for the selected product.');
  });
});