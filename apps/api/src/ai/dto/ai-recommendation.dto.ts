import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AiRecommendationDto {
  @ApiProperty({
    example: 'Suggest ANC headphones under ₹20,000 for travel and focus',
    description: 'Customer inquiry or shopping question (capped at 500 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Query must be at least 2 characters long' })
  @MaxLength(500, { message: 'Query length cannot exceed 500 characters' })
  query: string;

  @ApiPropertyOptional({ example: 'audio-acoustics', description: 'Optional category slug hint' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 20000, description: 'Optional budget ceiling in INR' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
