package pl.mifi.cqrs;

public interface CommandHandler<C extends Command, R> {
    R handle(C command);
}
