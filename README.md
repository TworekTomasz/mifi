# Idea
Application is used to track personal finances. It allows users to: 
- create budgets, 
- track accounts,
- categorize expenses,
- notify users of upcoming bills, transfers,
- import different bank statements,
- recipes recognition from images,
- generate reports.

## DDD

### Budget - Aggregate
- BudgetId (UUID)
- CategoryId (UUID)

### Category
- CategoryId (UUID)
- Name (string)
- Description (string)