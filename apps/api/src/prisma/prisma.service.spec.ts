import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect onModuleInit', async () => {
    const connectSpy = jest.spyOn(service, '$connect').mockImplementation(async () => {});
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
  });

  it('should handle $connect failure gracefully without uncaught rejection', async () => {
    jest.spyOn(service, '$connect').mockRejectedValueOnce(new Error('DB Connection Refused'));
    await expect(service.onModuleInit()).resolves.not.toThrow();
  });

  it('should call $disconnect onModuleDestroy', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockImplementation(async () => {});
    await service.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
