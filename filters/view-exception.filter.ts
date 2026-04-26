import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ViewExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const viewMap = {
      401: 'errors/401',
      403: 'errors/403',
      404: 'errors/404',
      422: 'errors/422',
      500: 'errors/500',
    };

    const view = viewMap[status] || 'errors/500';

    response.status(status).render(view, {
      message: exception.message || 'An unexpected error occurred',
      statusCode: status
    });
  }
}