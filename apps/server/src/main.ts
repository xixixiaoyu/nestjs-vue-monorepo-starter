import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NodeEnvironment } from "./config/environment";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  const configService = app.get(ConfigService);
  const environment =
    configService.get<NodeEnvironment>("NODE_ENV") ??
    NodeEnvironment.Development;

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Nest + Vue Template API")
    .setDescription("API reference generated from decorators")
    .setVersion("1.0.0")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = configService.get<number>("PORT") ?? 3001;
  await app.listen(port);
  console.log(
    JSON.stringify({
      level: "info",
      message: "server.started",
      port,
      environment,
      swagger: "/docs",
    }),
  );
}

bootstrap();
