package pl.mifi.cqrs.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import pl.mifi.cqrs.*;

@Component
public class MediatorImpl implements Mediator {

    private final ApplicationContext applicationContext;

    @Autowired
    public MediatorImpl(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <R, C extends Command> R send(C command) {
        CommandHandler<C, R> handler = (CommandHandler<C, R>) applicationContext.getBeansOfType(CommandHandler.class)
                .values().stream()
                .filter(h -> h.getClass().getGenericInterfaces()[0].getTypeName().contains(command.getClass().getSimpleName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No handler found for command: " + command.getClass().getSimpleName()));

        return handler.handle(command);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <R, Q extends Query<R>> R send(Q query) {
        QueryHandler<Q, R> handler = (QueryHandler<Q, R>) applicationContext.getBeansOfType(QueryHandler.class)
                .values().stream()
                .filter(h -> h.getClass().getGenericInterfaces()[0].getTypeName().contains(query.getClass().getSimpleName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No handler found for query: " + query.getClass().getSimpleName()));

        return handler.handle(query);
    }
}
