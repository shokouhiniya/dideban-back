import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilsService } from './libs/utils/utils.service';

const utilsService = new UtilsService();

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // Check if the error is an instance of HttpException

        if (err instanceof HttpException) {
          // Format the error response
          const response = err.getResponse();
          const status = err.getStatus();
          const formattedErrorResponse = {
            meta: {
              status,
              timestamp: new Date().toISOString(),
            },
            error: {
              message:
                typeof response === 'string'
                  ? response
                  : response['message'] || 'An unexpected error occurred',
              statusCode: status,
            },
          };

          // Return the formatted error response
          throw new HttpException(formattedErrorResponse, status);
        }

        // If not an HttpException, format it as a generic error
        const genericErrorResponse = {
          meta: {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
          },
          error: err,
        };

        // Throw a generic exception
        throw new HttpException(
          genericErrorResponse,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
      map((data) => {
        // Return the response in the desired format
        return {
          meta: {
            status: 'success',
            timestamp: utilsService.formatDateTimeString(),
            // Add other meta fields if needed
          },
          data, // This will be the data returned from the controller
        };
      }),
    );
  }
}
