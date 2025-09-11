package pl.mifi.cqrs;

//TODO: Probably command should not return a data
public interface CommandHandler<C extends Command> {
    void handle(C command);
}

