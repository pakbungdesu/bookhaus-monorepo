import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const token = 
      request.headers.authorization?.split(' ')[1] || 
      request.cookies?.['access_token']; 

      console.log('Extracted Token:', token); // Debugging line

    if (!token) {
      request['user'] = null; // Guest mode
      return true; 
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload; // This payload should contain DTYPE
    } catch (err) {
      request['user'] = null; // Invalid token = Guest mode
    }

    return true; 
  }
}

