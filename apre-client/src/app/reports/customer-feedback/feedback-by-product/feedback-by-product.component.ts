/**
 * Author: Meher Salim
 * File: feedback-by-product.component.ts
 * Description: Updated FeedbackByProductComponent to handle API response and error logging.
 */

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';

interface Feedback {
  customer: string;
  product: string;
  feedback: string;
  sentiment: string;
}

interface FeedbackResponse {
  feedbacks: Feedback[];
}

@Component({
  selector: 'app-feedback-by-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableComponent],
  template: `
    <div class="feedback-container">
      <div class="card__header">
        <h1>Customer Feedback by Product</h1>
      </div>
      <form [formGroup]="feedbackForm" (ngSubmit)="fetchFeedback()" class="form">
        <div class="form__group">
          <label class="label" for="product">Search by Product</label>
          <input
            class="input"
            type="text"
            id="product"
            formControlName="product"
            placeholder="Enter product name"
          />
        </div>
        <div class="form__actions">
          <button class="button button--secondary" type="button" (click)="resetForm()">Cancel</button>
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="card__body">
        <table class="table" *ngIf="feedbackData.length > 0">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Product</th>
              <th>Feedback</th>
              <th>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let feedback of feedbackData">
              <td>{{ feedback.customer }}</td>
              <td>{{ feedback.product }}</td>
              <td>{{ feedback.feedback }}</td>
              <td>{{ feedback.sentiment }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="feedbackData.length === 0" class="no-data">No feedback available for the selected product.</div>
      </div>
    </div>
  `,
  styles: `
    .feedback-container {
      margin: 20px;
    }

    h1 {
      font-size: 30px;
      text-align: center;
    }

    form {
      margin-bottom: 20px;
    }

    .no-data {
      text-align: center;
      margin-top: 15px;
      font-style: italic;
    }
  `
})

export class FeedbackByProductComponent implements OnInit {
  feedbackForm: FormGroup;
  feedbackData: Feedback[] = [];
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.feedbackForm = this.fb.group({
      product: [''],
    });
  }

  ngOnInit() {}

  fetchFeedback() {
    const product = this.feedbackForm.get('product')?.value;
  
    if (!product) {
      this.errorMessage = 'Please enter a product name.';
      return;
    }
  
    const encodedProduct = encodeURIComponent(product);
  
    this.http
      .get<FeedbackResponse>(`/api/reports/customer-feedback/product/${encodedProduct}`)
      .subscribe(
        (response) => {
          console.log('Response received: ', response);
          this.feedbackData = response.feedbacks;
          this.errorMessage = null;
        },
        (error) => {
          console.error('API call error: ', error);
          this.feedbackData = [];
          this.errorMessage = 'Failed to retrieve feedback data.';
        }
      );
  }

  resetForm() {
    this.feedbackForm.reset();
    this.feedbackData = [];
    this.errorMessage = null;
  }
}