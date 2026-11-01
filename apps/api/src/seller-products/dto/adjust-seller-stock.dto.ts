import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AdjustSellerStockDto {
  @ApiProperty({ example: 'variant-uuid-1' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 10, description: 'Positive delta to add stock, negative to subtract' })
  @IsInt()
  quantityDelta: number;
}
