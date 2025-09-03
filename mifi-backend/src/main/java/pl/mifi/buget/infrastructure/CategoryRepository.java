package pl.mifi.buget.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.mifi.buget.domain.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
}
