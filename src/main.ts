import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //  跨域
  // app.enableCors();
  // // app.setGlobalPrefix('/api/v1');
  // const config = new DocumentBuilder()
  //   .setTitle('短链服务 API')
  //   .setDescription('创建短链服务相关接口')
  //   .setVersion('1.0')
  //   .addTag('短链')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('doc', app, document);
  const port = app.get(ConfigService).get('PORT');
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
}
bootstrap();
