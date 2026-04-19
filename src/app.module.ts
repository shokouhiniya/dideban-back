import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './libs/database/database.module';
import { LoggerMiddleware } from './libs/logger/logger.middleware';
import { ConfigModule } from './libs/config/config.module';
import { UserModule } from './modules/user/user.module';
import { PersonModule } from './modules/person/person.module';
import { TopicModule } from './modules/topic/topic.module';
import { SourceModule } from './modules/source/source.module';
import { StatementModule } from './modules/statement/statement.module';
import { ScoreModule } from './modules/score/score.module';
import { SubmissionModule } from './modules/submission/submission.module';
import { VerificationModule } from './modules/verification/verification.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './libs/interceptors/response.interceptor';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    ConfigModule,
    UserModule,
    PersonModule,
    TopicModule,
    SourceModule,
    StatementModule,
    ScoreModule,
    SubmissionModule,
    VerificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
