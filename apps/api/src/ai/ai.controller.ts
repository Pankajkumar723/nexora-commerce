import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiRecommendationDto } from './dto/ai-recommendation.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get catalog-grounded AI product recommendations',
    description: 'Accepts customer intent/question and returns strictly catalog-grounded product suggestions with mandatory AI disclosure.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'AI recommendation returned successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid search prompt or malformed query payload',
  })
  async getRecommendations(@Body() dto: AiRecommendationDto) {
    return this.aiService.getRecommendations(dto);
  }
}
