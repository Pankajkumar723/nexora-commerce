import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Home', default: 'Home' })
  @IsOptional()
  @IsString()
  label?: string = 'Home';

  @ApiProperty({ example: '402, Cyber Heights, Sector 62' })
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiPropertyOptional({ example: 'Golf Course Extension Road' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Gurugram' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Haryana' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '122002' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiPropertyOptional({ example: 'India', default: 'India' })
  @IsOptional()
  @IsString()
  country?: string = 'India';

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}
