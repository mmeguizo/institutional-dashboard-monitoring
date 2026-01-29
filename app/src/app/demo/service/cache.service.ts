import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, tap, catchError, timer } from 'rxjs';
import { map } from 'rxjs/operators';

interface CacheEntry<T> {
    data: T;
    expiry: number;
    observable?: Observable<T>;
}

/**
 * Frontend Caching Service
 * Provides in-memory caching for frequently accessed data
 * Reduces API calls and improves perceived performance
 */
@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache = new Map<string, CacheEntry<any>>();

    // Default TTL values in milliseconds
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly TTL = {
        departments: 10 * 60 * 1000,    // 10 minutes
        users: 5 * 60 * 1000,           // 5 minutes
        goallists: 10 * 60 * 1000,      // 10 minutes
        campuses: 30 * 60 * 1000,       // 30 minutes
        goals: 3 * 60 * 1000,           // 3 minutes - goals change frequently
        dropdown: 15 * 60 * 1000,       // 15 minutes for dropdown data
    };

    constructor() {}

    /**
     * Get data from cache or execute observable and cache result
     * @param key Cache key
     * @param observable Observable to execute if cache miss
     * @param ttl Time to live in milliseconds
     */
    getOrFetch<T>(
        key: string,
        observable: Observable<T>,
        ttl?: number
    ): Observable<T> {
        const cached = this.cache.get(key);
        const now = Date.now();

        // Return cached data if valid
        if (cached && cached.expiry > now) {
            return of(cached.data);
        }

        // If there's an in-flight request, return it
        if (cached?.observable) {
            return cached.observable;
        }

        // Calculate TTL
        const cacheTTL = ttl || this.getTTLForKey(key) || this.DEFAULT_TTL;

        // Create new observable with shareReplay to prevent multiple requests
        const sharedObservable = observable.pipe(
            tap(data => {
                this.cache.set(key, {
                    data,
                    expiry: now + cacheTTL,
                    observable: undefined
                });
            }),
            catchError(error => {
                // Remove failed request from cache
                this.cache.delete(key);
                throw error;
            }),
            shareReplay(1)
        );

        // Store the in-flight observable
        this.cache.set(key, {
            data: null,
            expiry: 0,
            observable: sharedObservable
        });

        return sharedObservable;
    }

    /**
     * Get TTL based on key prefix
     */
    private getTTLForKey(key: string): number | undefined {
        if (key.startsWith('departments')) return this.TTL.departments;
        if (key.startsWith('users')) return this.TTL.users;
        if (key.startsWith('goallists')) return this.TTL.goallists;
        if (key.startsWith('campuses')) return this.TTL.campuses;
        if (key.startsWith('goals')) return this.TTL.goals;
        if (key.includes('dropdown')) return this.TTL.dropdown;
        return undefined;
    }

    /**
     * Invalidate a specific cache entry
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all cache entries matching a prefix
     */
    invalidateByPrefix(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Check if a key is cached and valid
     */
    has(key: string): boolean {
        const cached = this.cache.get(key);
        return cached !== undefined && cached.expiry > Date.now();
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
