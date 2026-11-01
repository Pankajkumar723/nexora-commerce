import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateSellerApplicationDto {
  @ApiProperty({ example: 'Nexora Electronics' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  storeName: string;

  @ApiProperty({ example: 'nexora-electronics' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Store slug can only contain lowercase letters, numbers, and hyphens',
  })
  storeSlug: string;

  @ApiPropertyOptional({ example: 'Premium electronics and gadgets retailer' })
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

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Plot 42, Cyber Gateway, Hitech City, Hyderabad, 500081' })
  @IsString()
  @IsNotEmpty()
  businessAddress: string;

  @ApiProperty({ example: '29ABCDE1234F1Z5' })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({ example: 'Nexora Retail Ltd' })
  @IsString()
  @IsNotEmpty()
  bankAccountName: string;

  @ApiProperty({ example: '918273645012' })
  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @ApiProperty({ example: 'HDFC0001234' })
  @IsString()
  @IsNotEmpty()
  bankIfscCode: string;

  @ApiProperty({ example: 'HDFC Bank Ltd' })
  @IsString()
  @IsNotEmpty()
  bankName: string;
}
