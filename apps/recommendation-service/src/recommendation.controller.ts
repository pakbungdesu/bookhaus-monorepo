import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommend')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get(':title')
  async getRecs(@Param('title') title: string) {
    try {
      const recommendations = await this.recommendationService.getBookRecommendations(title);
      console.log('Sending recommendations to browser:', recommendations);
      return recommendations;
      
    } catch (error) {

      console.error('Controller caught error:', error instanceof Error ? error.message : error);

      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }
}
