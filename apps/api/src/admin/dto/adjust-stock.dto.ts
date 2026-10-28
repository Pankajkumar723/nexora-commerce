import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustStockDto {
  @ApiProperty({ example: 'variant_uuid_or_id', description: 'Product Variant ID' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 25, description: 'Quantity change (positive for restock, negative for deduction)' })
  @Type(() => Number)
  @IsInt()
  quantityDelta: number;

  @ApiProperty({ example: 'RESTOCK_SHIPMENT', description: 'Audit rationale' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
