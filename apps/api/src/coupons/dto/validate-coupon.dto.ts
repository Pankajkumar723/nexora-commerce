import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ValidateCouponDto {
  @ApiProperty({ example: 'NEXORA10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 4500.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  orderSubtotal: number;
}
