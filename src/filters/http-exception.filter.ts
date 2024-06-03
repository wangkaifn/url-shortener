import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // 响应 请求对象
    const response = ctx.getResponse();
    const msg = (exception.getResponse() as { message: string[] }).message;

    // http状态码
    const status = exception.getStatus();
    response.status(status).json({
      code: status,
      success: false,
      message: msg?.join ? msg.join(',') : exception.message,
      data: null,
    });
  }
}
