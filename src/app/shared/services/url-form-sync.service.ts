import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, debounceTime, startWith, distinctUntilChanged } from 'rxjs/operators';

export type ControlSchema = Record<string, 'scalar' | 'dateRange' | 'array'>;

export interface FormUrlSyncConfig {
  formGroup: FormGroup;
  controlSchema: ControlSchema;
  defaults?: Record<string, any>;
  excludeKeysFn?: (snapshot: Record<string, any>) => string[];
  debounceMs?: number;
}

@Injectable()
export class UrlFormSyncService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private suppressUrlWrite = false;
  private suppressFormPatch = false;

  syncTwoWayWithSignals(config: FormUrlSyncConfig): void {
    const { formGroup, controlSchema, defaults = {}, excludeKeysFn, debounceMs = 200 } = config;

    const currentParams = this.router.routerState.snapshot.root.queryParams;
    const formSnapshot = this.paramsToFormSnapshot(currentParams, controlSchema, defaults);
    
    if (Object.keys(formSnapshot).length > 0) {
      this.suppressUrlWrite = true;
      formGroup.patchValue(formSnapshot, { emitEvent: false });
      this.suppressUrlWrite = false;
    }

    formGroup.valueChanges.pipe(
      startWith(formGroup.getRawValue()),
      debounceTime(debounceMs),
      distinctUntilChanged((prev, curr) => this.deepEqual(prev, curr)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((formValue) => {
      if (this.suppressUrlWrite) return;

      const newParams = this.formToParams(formValue, controlSchema, excludeKeysFn);
      const cleanedParams = this.cleanParams(newParams);
      
      if (!this.deepEqual(currentParams, cleanedParams)) {
        this.router.navigate([], {
          queryParams: cleanedParams,
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.suppressFormPatch) return;

      const queryParams = this.router.routerState.snapshot.root.queryParams;
      const formSnapshot = this.paramsToFormSnapshot(queryParams, controlSchema, defaults);
      
      this.suppressUrlWrite = true;
      formGroup.patchValue(formSnapshot, { emitEvent: false });
      this.suppressUrlWrite = false;
    });
  }

  private paramsToFormSnapshot(
    params: Record<string, any>,
    schema: ControlSchema,
    defaults: Record<string, any>
  ): Record<string, any> {
    const snapshot: Record<string, any> = {};

    for (const [key, type] of Object.entries(schema)) {
      const paramValue = params[key];
      
      if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
        snapshot[key] = this.deserializeValue(paramValue, type);
      } else if (defaults[key] !== undefined) {
        snapshot[key] = defaults[key];
      } else {
        snapshot[key] = this.getDefaultValueForType(type);
      }
    }

    return snapshot;
  }

  private formToParams(
    formValue: Record<string, any>,
    schema: ControlSchema,
    excludeKeysFn?: (snapshot: Record<string, any>) => string[]
  ): Record<string, any> {
    const params: Record<string, any> = {};
    const excludeKeys = excludeKeysFn ? excludeKeysFn(formValue) : [];

    for (const [key, type] of Object.entries(schema)) {
      if (excludeKeys.includes(key)) continue;
      
      const value = formValue[key];
      if (value !== undefined && value !== null) {
        const serialized = this.serializeValue(value, type);
        if (serialized !== null) {
          params[key] = serialized;
        }
      }
    }

    return params;
  }

  private serializeValue(value: any, type: 'scalar' | 'dateRange' | 'array'): string | null {
    if (value === null || value === undefined) return null;

    switch (type) {
      case 'scalar':
        if (value instanceof Date) {
          return value.toISOString().slice(0, 10);
        }
        return String(value);

      case 'dateRange':
        if (typeof value === 'object' && value.from && value.to) {
          const from = value.from instanceof Date ? value.from : new Date(value.from);
          const to = value.to instanceof Date ? value.to : new Date(value.to);
          
          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            return `${from.toISOString().slice(0, 10)}..${to.toISOString().slice(0, 10)}`;
          }
        }
        return null;

      case 'array':
        if (Array.isArray(value) && value.length > 0) {
          return [...new Set(value)].sort().join(',');
        }
        return null;

      default:
        return String(value);
    }
  }

  private deserializeValue(paramValue: string, type: 'scalar' | 'dateRange' | 'array'): any {
    switch (type) {
      case 'scalar':
        if (/^\d{4}-\d{2}-\d{2}$/.test(paramValue)) {
          const date = new Date(paramValue);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
        if (!isNaN(Number(paramValue))) {
          return Number(paramValue);
        }
        if (paramValue === 'true') return true;
        if (paramValue === 'false') return false;
        return paramValue;

      case 'dateRange':
        if (paramValue.includes('..')) {
          const [fromStr, toStr] = paramValue.split('..');
          const from = new Date(fromStr);
          const to = new Date(toStr);
          
          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            return { from, to };
          }
        }
        return null;

      case 'array':
        if (paramValue.includes(',')) {
          return paramValue.split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .sort();
        }
        return [paramValue];

      default:
        return paramValue;
    }
  }

  private getDefaultValueForType(type: 'scalar' | 'dateRange' | 'array'): any {
    switch (type) {
      case 'scalar':
        return null;
      case 'dateRange':
        return { from: null, to: null };
      case 'array':
        return [];
      default:
        return null;
    }
  }

  private cleanParams(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) && value.length === 0) {
          continue;
        }
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
    
    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!this.deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }
}
