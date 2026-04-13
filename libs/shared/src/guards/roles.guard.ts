import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Match the key 'roles' from your decorator
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    // Check if user has the specific DTYPE OR is a Manager
    const hasRole = requiredRoles.includes(user.DTYPE) || 
                    (user.DTYPE === 'Employee' && user.position === 'Manager');
    
    if (!hasRole) throw new ForbiddenException('Access Denied');
    
    return true;
  }
}
