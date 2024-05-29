import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateShortLinkDto {
  @IsNotEmpty({
    message: 'URL 不能为空',
  })
  @IsUrl({}, { message: 'URL 格式不正确' })
  originalUrl: string;
}
