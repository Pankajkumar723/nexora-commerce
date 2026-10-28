import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentOrderDto {
  @ApiProperty({ example: 'order_uuid_or_id', description: 'Local Order ID' })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
