package pl.mifi.cqrs;

public interface Mediator {
    <R, C extends Command> R send(C command);
    <R, Q extends Query> R get(Q query);
}
