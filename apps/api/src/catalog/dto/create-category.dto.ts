import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Audio & Acoustics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'audio-acoustics' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Studio-grade spatial headphones and earbuds.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-example' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 'parent_category_id' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
