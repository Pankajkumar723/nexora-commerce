import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { BadRequestException } from '@nestjs/common';

describe('AiController', () => {
  let controller: AiController;
  let service: AiService;

  const mockAiService = {
    getRecommendations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get<AiService>(AiService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecommendations', () => {
    it('should invoke aiService.getRecommendations and return response', async () => {
      const mockResult = {
        explanation: 'Recommended based on noise cancellation.',
        products: [],
        suggestedFilters: { category: 'audio-acoustics' },
        isAiGenerated: true,
        modelUsed: 'gemini-1.5-flash',
        disclosure: 'AI-generated recommendations grounded in verified Nexora catalog data.',
      };

      mockAiService.getRecommendations.mockResolvedValueOnce(mockResult);

      const dto = { query: 'Best ANC headphones' };
      const result = await controller.getRecommendations(dto);

      expect(service.getRecommendations).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });

    it('should forward service errors', async () => {
      mockAiService.getRecommendations.mockRejectedValueOnce(
        new BadRequestException('Please provide a valid shopping question.'),
      );

      await expect(controller.getRecommendations({ query: ' ' })).rejects.toThrow(BadRequestException);
    });
  });
});
