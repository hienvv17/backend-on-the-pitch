// import { Module } from '@nestjs/common';
// import { CacheService } from './cache.service';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { CacheModule as SystemCacheModule } from '@nestjs/cache-manager';
// import type { RedisClientOptions } from 'redis';
// import { redisStore } from 'cache-manager-redis-yet';

// @Module({
//     imports: [
//         SystemCacheModule.registerAsync<RedisClientOptions>({
//             imports: [ConfigModule],
//             useFactory: async (config: ConfigService) => {
//                 if (config.get('cache.driver') === 'redis') {
//                     return {
//                         store: await redisStore({
//                             socket: {
//                                 host: config.get('cache.host'),
//                                 port: config.get('cache.port'),
//                             },
//                             ttl: config.get('cache.ttl'),
//                         }),
//                     };
//                 } else {
//                     return {
//                         ttl: config.get('cache.ttl'),
//                     };
//                 }
//             },
//             inject: [ConfigService],
//             isGlobal: true,
//         }),
//     ],
//     providers: [CacheService],
//     exports: [CacheService],
// })
// export class CacheModule {}