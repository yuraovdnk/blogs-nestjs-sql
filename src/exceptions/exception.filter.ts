import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (process.env.environment !== 'production') {
      response.status(500).send({
        error: exception.toString(),
        exception: exception.stack,
      });
    }
    response.status(500).json('some error occured');
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (
      exception instanceof InternalServerErrorException &&
      process.env.environment !== 'production'
    ) {
      const errors: any = exception.getResponse();
      response.status(status).json(errors);
    }
    if (exception instanceof BadRequestException) {
      const errors: any = exception.getResponse();
      console.log(errors);
      response.status(status).json({
        errorsMessages: errors.message,
      });
    }

    response.status(status).send();
  }
}
