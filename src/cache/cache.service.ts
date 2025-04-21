import { Injectable, Logger } from '@nestjs/common';
import NodeCache from 'node-cache';
import constants from '../config/constants';

@Injectable()
export class CacheService {
    private readonly cache: NodeCache;
    private readonly logger = new Logger(CacheService.name);

    constructor() {
        this.cache = new NodeCache({ stdTTL: 120, checkperiod: 120 });
    }

    set<T>(key: string, value: T, ttl?: number): boolean {
        const success = this.cache.set(key, value, ttl || constants.cache.minutes.default);
        if (success) {
            this.logger.debug(`Cache set: ${key}`);
        }
        return success;
    }

    get<T>(key: string): T | undefined {
        const value = this.cache.get<T>(key);
        if (value) {
            this.logger.debug(`Cache hit: ${key}`);
        } else {
            this.logger.debug(`Cache miss: ${key}`);
        }
        return value;
    }

    del(key: string): number {
        this.logger.debug(`Cache delete: ${key}`);
        return this.cache.del(key);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    flush(): void {
        this.logger.debug('Cache flushed');
        this.cache.flushAll();
    }
}
