import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSessionRepository } from '../../auth/infrastructure/auth-session.repository';

export class TerminateSessionsCommand {
  constructor(public readonly deviceId: string, public readonly userId: string) {}
}

@CommandHandler(TerminateSessionsCommand)
export class TerminateSessionsUseCase implements ICommandHandler<TerminateSessionsCommand> {
  constructor(private authSessionRepository: AuthSessionRepository) {}
  async execute(command: TerminateSessionsCommand) {
    return this.authSessionRepository.deleteAllSessions(command.deviceId, command.userId);
  }
}
