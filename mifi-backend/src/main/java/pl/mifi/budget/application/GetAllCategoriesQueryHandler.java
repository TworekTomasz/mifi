package pl.mifi.budget.application;

import org.springframework.stereotype.Component;
import pl.mifi.budget.domain.Category;
import pl.mifi.budget.infrastructure.CategoryRepository;
import pl.mifi.cqrs.QueryHandler;

import java.util.List;

@Component
public class GetAllCategoriesQueryHandler implements QueryHandler<GetAllCategoriesQuery, List<Category>> {

    private CategoryRepository categoryRepository;

    public GetAllCategoriesQueryHandler(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> handle(GetAllCategoriesQuery query) {
        return categoryRepository.findAll();
    }
}
