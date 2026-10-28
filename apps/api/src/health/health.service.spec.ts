import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return status ok when database is reachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ '?column?': 1 }]);

    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(result.version).toBe('1.0.0');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return status degraded when database is disconnected', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Connection failure'));

    const result = await service.check();
    expect(result.status).toBe('degraded');
    expect(result.database).toBe('disconnected');
  });
});
