import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { FilteredAbstractComponent } from '../../../shared/components/filtered-abstract.component';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker.component';
import { FormUrlSyncDirective } from '../../../shared/directives/form-url-sync.directive';
import { ControlSchema } from '../../../shared/services/url-form-sync.service';
import { ControlsOf } from '../../../shared/models/controls-of';

export enum PaymentType {
  Ep = 'ep',
  Epu = 'epu',
  Esv = 'esv',
}

export type PaymentModel = {
  type: PaymentType;
  startDate: Date;
  endDate: Date;
  userId: number;
  accountId: number;
};

export type PaymentFiltersModel = Partial<
  Omit<PaymentModel, 'startDate' | 'endDate'> & {
    dateRange: { from: Date | null; to: Date | null };
  }
>;

@Component({
  selector: 'payment-payments',
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatProgressBarModule,
    DateRangePickerComponent,
    FormUrlSyncDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent
  extends FilteredAbstractComponent<PaymentModel[], PaymentFiltersModel>
  implements OnInit
{
  protected readonly PaymentType = PaymentType;

  private readonly fb = inject(FormBuilder);
  
  protected readonly controlSchema: ControlSchema = {
    type: 'scalar',
    dateRange: 'dateRange',
    accountId: 'scalar',
    userId: 'scalar',
  };

  protected createFilters(): FormGroup<ControlsOf<PaymentFiltersModel>> {
    return this.fb.group<ControlsOf<PaymentFiltersModel>>({
      type: this.fb.control<PaymentType>(null),
      dateRange: this.fb.control<{ from: Date | null; to: Date | null }>({ from: null, to: null }),
      accountId: this.fb.control<number>(null),
      userId: this.fb.control<number>(null),
    });
  }

  protected loadData(): Observable<PaymentModel[]> {
    return of([]).pipe(delay(500));
  }
}
