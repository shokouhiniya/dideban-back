import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';
import { PoliticiansModule } from './modules/politicians/politicians.module';
import { StancesModule } from './modules/stances/stances.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { VerificationModule } from './modules/verification/verification.module';
import { CodebookModule } from './modules/codebook/codebook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'dideban'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    PoliticiansModule,
    StancesModule,
    SubmissionsModule,
    VerificationModule,
    CodebookModule,
  ],
})
export class AppModule {}
