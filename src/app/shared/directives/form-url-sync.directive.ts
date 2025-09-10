import { Directive, Input, OnInit, inject, DestroyRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UrlFormSyncService, ControlSchema } from '../services/url-form-sync.service';

@Directive({
  selector: '[formUrlSync]',
  standalone: true,
  providers: [UrlFormSyncService]
})
export class FormUrlSyncDirective implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlSchema!: ControlSchema;
  @Input() defaults?: Record<string, any>;
  @Input() excludeKeysFn?: (snapshot: Record<string, any>) => string[];
  @Input() debounceMs?: number;

  private readonly urlFormSyncService = inject(UrlFormSyncService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    if (!this.formGroup || !this.controlSchema) {
      console.warn('FormUrlSyncDirective: formGroup and controlSchema are required');
      return;
    }

    this.urlFormSyncService.syncTwoWayWithSignals({
      formGroup: this.formGroup,
      controlSchema: this.controlSchema,
      defaults: this.defaults,
      excludeKeysFn: this.excludeKeysFn,
      debounceMs: this.debounceMs
    });
  }
}
