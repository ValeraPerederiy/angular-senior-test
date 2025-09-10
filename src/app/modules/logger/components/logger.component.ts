import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadge } from '@angular/material/badge';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { FilteredAbstractComponent } from '../../../shared/components/filtered-abstract.component';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker.component';
import { UiToggleGroupSingleDirective } from '../../../shared/directives/ui-toggle-group-single.directive';
import { FormUrlSyncDirective } from '../../../shared/directives/form-url-sync.directive';
import { ControlSchema } from '../../../shared/services/url-form-sync.service';

import { ControlsOf } from '../../../shared/models/controls-of';

export type LoggerModel = {
  accountId: number;
  needToFix: boolean;
  level: string[];
  title: string;
  datetime: Date;
};

export type LoggerFiltersModel = Partial<
  Omit<LoggerModel, 'datetime'> & {
    createdDateRange: { from: Date | null; to: Date | null };
  }
>;

@Component({
  selector: 'logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatBadge,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatProgressBarModule,
    DateRangePickerComponent,
    UiToggleGroupSingleDirective,
    FormUrlSyncDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoggerComponent extends FilteredAbstractComponent<LoggerModel[], LoggerFiltersModel> implements OnInit {
  protected needFixCount = signal<number>(1);

  private readonly fb = inject(FormBuilder);

  protected readonly controlSchema: ControlSchema = {
    accountId: 'scalar',
    needToFix: 'scalar',
    level: 'array',
    title: 'scalar',
    createdDateRange: 'dateRange'
  };

  protected createFilters(): FormGroup<ControlsOf<LoggerFiltersModel>> {
    return this.fb.group<ControlsOf<LoggerFiltersModel>>({
      accountId: this.fb.control<number>(null),
      needToFix: this.fb.control<boolean>(null),
      level: this.fb.control<string[]>(null),
      title: this.fb.control<string>(null),
      createdDateRange: this.fb.control<{ from: Date | null; to: Date | null }>({ from: null, to: null }),
    });
  }

  protected loadData(): Observable<LoggerModel[]> {
    return of([]).pipe(delay(500));
  }
}
