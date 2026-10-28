import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'address_uuid_or_id', description: 'Saved shipping address ID' })
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiPropertyOptional({ example: 'NEXORA10', description: 'Promotional discount code' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Please leave package with front security desk.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
