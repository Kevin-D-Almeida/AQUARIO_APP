import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    let httpException: HttpException;

    if (exception.code === 'P2002') {
      httpException = new ConflictException(
        'Já existe um registro com esses dados',
      );
    } else if (exception.code === 'P2003') {
      httpException = new ConflictException(
        'A operação não pode ser concluída porque existem dados relacionados',
      );
    } else if (exception.code === 'P2025') {
      httpException = new NotFoundException('Registro não encontrado');
    } else {
      httpException = new InternalServerErrorException(
        'Não foi possível concluir a operação',
      );
    }

    const response = host.switchToHttp().getResponse<Response>();
    const status = httpException.getStatus();
    const body = httpException.getResponse();

    response
      .status(status)
      .json(
        typeof body === 'string' ? { statusCode: status, message: body } : body,
      );
  }
}
