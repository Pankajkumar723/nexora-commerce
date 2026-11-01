import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class RequestPayoutDto {
  @ApiProperty({ example: 5000, description: 'Requested withdrawal amount in INR' })
  @IsNumber()
  @IsPositive()
  @Min(500, { message: 'Minimum payout request amount is ₹500' })
  amount: number;

  @ApiPropertyOptional({ example: 'Monthly withdrawal request' })
  @IsOptional()
  @IsString()
  notes?: string;
}
