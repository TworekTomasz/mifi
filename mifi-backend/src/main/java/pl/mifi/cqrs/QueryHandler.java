package pl.mifi.cqrs;

public interface QueryHandler<Q extends Query, R> {
    R handle(Q query);
}