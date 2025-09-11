package pl.mifi.cqrs;

public interface Mediator {
    <C extends Command> void send(C command);
    <R, Q extends Query> R get(Q query);
}
