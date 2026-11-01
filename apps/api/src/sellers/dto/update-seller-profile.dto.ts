import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSellerProfileDto {
  @ApiPropertyOptional({ example: 'Nexora Superstore' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  storeName?: string;

  @ApiPropertyOptional({ example: 'Updated store description' })
  @IsOptional()
  @IsString()
  storeDescription?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3' })
  @IsOptional()
  @IsString()
  storeLogo?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da' })
  @IsOptional()
  @IsString()
  storeBanner?: string;

  @ApiPropertyOptional({ example: '+91 99887 76655' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'New office address, Bangalore' })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiPropertyOptional({ example: 'Nexora Retail Global' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional({ example: '918273645012' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'HDFC0005678' })
  @IsOptional()
  @IsString()
  bankIfscCode?: string;

  @ApiPropertyOptional({ example: 'HDFC Bank Ltd' })
  @IsOptional()
  @IsString()
  bankName?: string;
}
