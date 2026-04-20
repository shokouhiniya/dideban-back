import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { VerificationReview } from './entities/verification-review.entity';
import { SourceConflict } from './entities/source-conflict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationReview, SourceConflict])],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
