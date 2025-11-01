package pl.mifi.budget.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.mifi.budget.domain.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
}
