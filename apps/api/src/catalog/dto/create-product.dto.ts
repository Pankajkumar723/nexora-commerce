import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class CreateProductImageDto {
  @ApiProperty({ example: 'https://images.unsplash.com/photo-example' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Front angle of wireless headphone' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateProductVariantDto {
  @ApiProperty({ example: 'NEX-HP-BLK' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: { color: 'Matte Black', size: 'Standard' } })
  @IsObject()
  attributes: Record<string, any>;

  @ApiPropertyOptional({ example: 19999.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceOverride?: number;

  @ApiProperty({ example: 50, default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number = 0;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Nexora Studio Pro Wireless ANC Headphones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'nexora-studio-pro-wireless-anc-headphones' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Engineered with 40mm custom drivers and hybrid active noise cancellation.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 18999.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 22999.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;

  @ApiProperty({ example: 'cat_audio_uuid_or_id' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}
