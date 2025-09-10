import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { delay, Observable, of } from 'rxjs';

import { FilteredAbstractComponent } from '../../../shared/components/filtered-abstract.component';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker.component';
import { UiToggleGroupSingleDirective } from '../../../shared/directives/ui-toggle-group-single.directive';

import { ControlSchema } from '../../../shared/services/url-form-sync.service';

import { ControlsOf } from '../../../shared/models/controls-of';
import { FormUrlSyncDirective } from '../../../shared/directives/form-url-sync.directive';

export type StatsModel = {};

export type StatsFiltersModel = Partial<{
  periodRange: { from: Date | null; to: Date | null };
  comparePeriodRange: { from: Date | null; to: Date | null };
}>;

@Component({
  selector: 'stats-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatProgressBarModule,
    DateRangePickerComponent,
    UiToggleGroupSingleDirective,
    FormUrlSyncDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent extends FilteredAbstractComponent<StatsModel[], StatsFiltersModel> implements OnInit {
  protected isCompareMode = signal<boolean>(false);

  private readonly fb = inject(FormBuilder);

  protected readonly controlSchema: ControlSchema = {
    periodRange: 'dateRange',
    comparePeriodRange: 'dateRange'
  };

  protected readonly defaults = computed(() => {
    const today = new Date();
    return {
      periodRange: {
        from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14),
        to: today
      }
    };
  });

  protected readonly excludeKeysFn = (snapshot: Record<string, any>) => {
    return this.isCompareMode() ? [] : ['comparePeriodRange'];
  };

  protected createFilters(): FormGroup<ControlsOf<StatsFiltersModel>> {
    return this.fb.group<ControlsOf<StatsFiltersModel>>({
      periodRange: this.fb.control<{ from: Date | null; to: Date | null }>({ from: null, to: null }, Validators.required),
      comparePeriodRange: this.fb.control<{ from: Date | null; to: Date | null }>({ from: null, to: null }),
    });
  }

  protected toggleCompare(): void {
    const compareControl = this.filterFormGroup.get('comparePeriodRange');
    
    if (compareControl?.enabled) {
      compareControl.reset({ from: null, to: null }, { emitEvent: false });
      compareControl.disable({ emitEvent: false });
    } else {
      compareControl?.enable({ emitEvent: false });
    }

    this.isCompareMode.set(compareControl?.enabled ?? false);
  }

  protected loadData(): Observable<StatsModel[]> {
    return of([]).pipe(delay(500));
  }
}
