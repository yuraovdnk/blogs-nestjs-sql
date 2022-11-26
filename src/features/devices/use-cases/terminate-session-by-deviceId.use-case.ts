import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSessionRepository } from '../../auth/infrastructure/auth-session.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class TerminateSessionByDeviceIdCommand {
  constructor(public readonly deviceId: string, public readonly userId: string) {}
}
@CommandHandler(TerminateSessionByDeviceIdCommand)
export class TerminateSessionByDeviceIdUseCase
  implements ICommandHandler<TerminateSessionByDeviceIdCommand>
{
  constructor(private authSessionsRepository: AuthSessionRepository) {}

  async execute(command: TerminateSessionByDeviceIdCommand): Promise<any> {
    const session = await this.authSessionsRepository.getSessionById(command.deviceId);
    if (!session) {
      throw new NotFoundException();
    }

    if (session.userId !== command.userId) {
      throw new ForbiddenException();
    }
    return this.authSessionsRepository.deleteSession(command.userId, command.deviceId);
  }
}
