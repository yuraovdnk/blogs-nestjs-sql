import { AuthSessionRepository } from '../../auth/infrastructure/auth-session.repository';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DevicesService {
  constructor(private authSessionsRepository: AuthSessionRepository) {}
}
