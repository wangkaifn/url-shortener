import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateShortLinkDto {
  @ApiProperty({ name: 'title', description: '标题', required: true })
  @IsNotEmpty({
    message: '标题不能为空',
  })
  title: string;

  @ApiProperty({ name: 'originalUrl', description: 'URL链接', required: true })
  @IsNotEmpty({
    message: 'URL 不能为空',
  })
  @IsUrl({}, { message: 'URL 格式不正确' })
  originalUrl: string;

  @ApiProperty({ name: 'desc', description: '描述' })
  desc: string;
}
