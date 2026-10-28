import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { apiSuccess } from '../common/dto/api-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'System health check and database connectivity status' })
  @ApiResponse({ status: 200, description: 'Service health check details' })
  async check() {
    const health = await this.healthService.check();
    return apiSuccess(health, null, 'Service is healthy');
  }
}
