import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class CreateAdminCouponDto {
  @ApiProperty({ example: 'FLASH20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 20.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 1000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: '2026-10-28T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  startsAt?: Date;

  @ApiProperty({ example: '2027-10-28T00:00:00.000Z' })
  @Type(() => Date)
  expiresAt: Date;

  @ApiPropertyOptional({ example: 500, default: 100 })
  @IsOptional()
  @Type(() => Number)
  usageLimit?: number;
}
