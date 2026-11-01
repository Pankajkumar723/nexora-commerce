import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FulfillmentStatus } from '@prisma/client';

export class UpdateFulfillmentStatusDto {
  @ApiProperty({ enum: FulfillmentStatus, example: FulfillmentStatus.SHIPPED })
  @IsEnum(FulfillmentStatus)
  @IsNotEmpty()
  status: FulfillmentStatus;

  @ApiPropertyOptional({ example: 'AWB98234123IN' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'BlueDart / Delhivery' })
  @IsOptional()
  @IsString()
  shippingCarrier?: string;
}
