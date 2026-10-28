import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check wrapped in apiSuccess envelope', async () => {
    const mockHealth = {
      status: 'ok' as const,
      timestamp: '2026-10-28T05:00:00.000Z',
      uptime: 120,
      environment: 'development',
      database: 'connected' as const,
      version: '1.0.0',
    };

    (service.check as jest.Mock).mockResolvedValueOnce(mockHealth);

    const result = await controller.check();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockHealth);
    expect(result.message).toBe('Service is healthy');
  });
});
