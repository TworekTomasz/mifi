package pl.mifi.cqrs.impl;

import org.springframework.aop.framework.AopProxyUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import pl.mifi.cqrs.*;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

@Component
public class MediatorImpl implements Mediator {

    //TODO: Find all handlers when application starts https://chatgpt.com/c/67ea4519-4664-8000-b364-067efade2007

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
                .filter(h -> {
                    Class<?> targetClass = AopProxyUtils.ultimateTargetClass(h);
                    Type[] genericInterfaces = targetClass.getGenericInterfaces();
                    for (Type genericInterface : genericInterfaces) {
                        if (genericInterface instanceof ParameterizedType) {
                            ParameterizedType parameterizedType = (ParameterizedType) genericInterface;
                            Type[] actualTypeArguments = parameterizedType.getActualTypeArguments();
                            if (actualTypeArguments.length > 0 && actualTypeArguments[0].equals(command.getClass())) {
                                return true;
                            }
                        }
                    }
                    return false;
                })
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No handler found for command: " + command.getClass().getSimpleName()));

        return handler.handle(command);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <R, Q extends Query> R get(Q query) {
        QueryHandler<Q, R> handler = (QueryHandler<Q, R>) applicationContext.getBeansOfType(QueryHandler.class)
                .values().stream()
                .filter(h -> {
                    Class<?> targetClass = AopProxyUtils.ultimateTargetClass(h);
                    Type[] genericInterfaces = targetClass.getGenericInterfaces();
                    for (Type genericInterface : genericInterfaces) {
                        if (genericInterface instanceof ParameterizedType) {
                            ParameterizedType parameterizedType = (ParameterizedType) genericInterface;
                            Type[] actualTypeArguments = parameterizedType.getActualTypeArguments();
                            if (actualTypeArguments.length > 0 && actualTypeArguments[0].equals(query.getClass())) {
                                return true;
                            }
                        }
                    }
                    return false;
                })
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No handler found for query: " + query.getClass().getSimpleName()));

        return handler.handle(query);
    }
}
