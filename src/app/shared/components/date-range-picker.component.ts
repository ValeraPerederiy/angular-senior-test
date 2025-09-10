import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel, MatDatepickerToggle, MatDateRangeInput, MatDateRangePicker, MatEndDate, MatStartDate } from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

@Component({
  selector: 'app-date-range-picker',
  template: `
    <mat-form-field>
      <mat-label>{{ label }}</mat-label>

      <mat-date-range-input [rangePicker]="rangePicker">
        <input 
          [value]="value?.from" 
          (dateChange)="onFromDateChange($event.value)"
          matStartDate 
          [placeholder]="fromPlaceholder" />
        <input 
          [value]="value?.to" 
          (dateChange)="onToDateChange($event.value)"
          matEndDate 
          [placeholder]="toPlaceholder" />
      </mat-date-range-input>

      <mat-datepicker-toggle matSuffix [for]="rangePicker"></mat-datepicker-toggle>

      <mat-date-range-picker #rangePicker>
        <mat-date-range-picker-actions>
          <button mat-button matDateRangePickerCancel>{{ cancelText }}</button>
          <button mat-raised-button color="primary" matDateRangePickerApply>{{ applyText }}</button>
        </mat-date-range-picker-actions>
      </mat-date-range-picker>
    </mat-form-field>
  `,
  imports: [
    MatFormField,
    MatLabel,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDatepickerToggle,
    MatSuffix,
    MatDateRangePicker,
    MatDatepickerActions,
    MatButton,
    MatDatepickerCancel,
    MatDatepickerApply,
    MatNativeDateModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true
    }
  ],
  standalone: true
})
export class DateRangePickerComponent implements ControlValueAccessor {
  @Input() label = 'Дата';
  @Input() fromPlaceholder = 'З';
  @Input() toPlaceholder = 'По';
  @Input() cancelText = 'Скасувати';
  @Input() applyText = 'Застосувати';

  value: DateRange | null = null;
  private onChange = (value: DateRange | null) => {};
  private onTouched = () => {};

  onFromDateChange(date: Date | null): void {
    this.value = { ...this.value, from: date };
    this.onChange(this.value);
    this.onTouched();
  }

  onToDateChange(date: Date | null): void {
    this.value = { ...this.value, to: date };
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: DateRange | null): void {
    this.value = value || { from: null, to: null };
  }

  registerOnChange(fn: (value: DateRange | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
