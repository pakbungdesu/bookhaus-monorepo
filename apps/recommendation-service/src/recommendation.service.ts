import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationService {
  constructor(private readonly httpService: HttpService) {}
  
  async getBookRecommendations(bookTitle: string) {
      const url = `http://recommender-model:8000/recommend/${encodeURIComponent(bookTitle)}`;
      console.log(`Attempting to call Python service at: ${url}`);
      
      try {
        const response = await firstValueFrom(this.httpService.get(url, { timeout: 5000 }));
        return response.data;
      } catch (error: unknown) {
        const err = error as any; 

        if (err.response) {
          console.error('Python API returned error:', err.response.status, err.response.data);
        } else {
          console.error('Connection error:', err.message);
        }
      
        throw new Error('Recommendation engine failed');
      }
  }
}
