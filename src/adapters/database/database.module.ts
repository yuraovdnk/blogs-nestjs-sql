import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConfig } from '../../configuration/config';
import { DataSource } from 'typeorm';

const configModule = ConfigModule.forRoot({
  load: [getConfig],
  isGlobal: true,
  envFilePath: ['.env'],
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [configModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: false,
        synchronize: true,
        poolSize: 5,
        extra: {
          connectionLimit: 5,
          max: 5,
          connectionTimeoutMillis: 1000,
        },
        url:
          process.env.NODE_ENV === 'production'
            ? configService.get<string>('db.postgresUriProduction')
            : configService.get<string>('db.postgresUriDev'),
      }),

      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
