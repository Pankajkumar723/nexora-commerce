import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @ApiProperty({ example: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Smart Watch front view' })
  @IsOptional()
  @IsString()
  alt?: string;
}

export class ProductVariantDto {
  @ApiProperty({ example: 'SW-BLK-01' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: { color: 'Black', size: 'Standard' } })
  @IsNotEmpty()
  attributes: Record<string, any>;

  @ApiPropertyOptional({ example: 4999 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  priceOverride?: number;

  @ApiProperty({ example: 25 })
  @IsNumber()
  stockQuantity: number;
}

export class CreateSellerProductDto {
  @ApiProperty({ example: 'Ultra Wireless Noise-Cancelling Headphones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ultra-wireless-noise-cancelling-headphones' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'High-fidelity audio with 40-hour battery life and fast charging.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 7999 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: 9999 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  compareAtPrice?: number;

  @ApiProperty({ example: 'category-uuid-or-slug' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ type: [ProductImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images: ProductImageDto[];

  @ApiPropertyOptional({ example: 'Nexora Acoustics' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: { hsnCode: '85183000', gstRate: 18 } })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ type: [ProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
