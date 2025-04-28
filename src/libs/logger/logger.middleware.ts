import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UtilsService } from '../utils/utils.service';

const utilsService = new UtilsService();

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(utilsService.formatDateTimeString(), req.method, req.baseUrl);
    next();
  }
}
