// src/utils/utils.module.ts

import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Module({
  providers: [UtilsService],
  exports: [UtilsService], // Export the service so it can be used in other modules
})
export class UtilsModule {}
