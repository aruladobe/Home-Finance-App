# FinanceHome — Features

## 1. Authentication
Secure sign-up and login using JWT. Passwords are hashed with bcryptjs. Sessions persist via token stored on the client.

## 2. Dashboard
Central overview of your financial health for a selected period or financial year.
- Summary stat cards: total income, expenses, investments, and net profit
- Monthly income vs. expenses bar chart
- Expense breakdown by category (pie chart)
- Income breakdown by type
- Area chart showing financial trends over time

## 3. Income Tracking
Log and manage all income sources.
- Add, edit, and delete income entries
- Categorize by type (salary, freelance, rental, etc.)
- Assign to a family member
- Set recurring income with effective date range
- Projection panel shows how much income is expected over the active period

## 4. Expense Management
Track where money is being spent.
- Add, edit, and delete expense records
- Categorize expenses (food, transport, utilities, etc.)
- Assign expenses to family members
- Projection panel for recurring expenses
- Filter and sort by date, category, or amount

## 5. Investment Tracking
Monitor your investment portfolio.
- Log investments by type (stocks, mutual funds, fixed deposit, etc.)
- Assign to family members
- Track investment amount and duration
- View investment trends alongside income and expenses

## 6. Planned Expenses
Budget for future or one-time expenditures.
- Schedule upcoming expenses with a target date
- Mark planned expenses as completed
- Track pending vs. completed planned spend

## 7. Profit & Analysis
Dedicated page for net profit analysis.
- Net profit = Income − Expenses − Investments
- Monthly trend area chart with cumulative profit line
- Stat cards: net profit, savings rate, total invested, portfolio value
- Break-even and profit/loss visualization per month

## 8. Financial Calculator
Built-in calculator with four modes — no external tool needed.
- **EMI** — monthly installment, total payable, and full amortization schedule
- **Simple Interest** — principal, rate, time → interest and total
- **Compound Interest** — principal, rate, time, compounding frequency → maturity value
- **Percentage** — quick percentage-of and percentage-change calculations

## 9. Statement Download
Export financial data as a report for any custom date range.
- Choose preset ranges (this month, last 3 months, financial year, etc.) or set a custom range
- Preview record count and totals before downloading
- Download as **PDF** (formatted table via jsPDF) or **CSV** (spreadsheet-ready)

## 10. Family Member Management
Manage the household members whose finances are tracked.
- Add members with name, relationship, age, email, phone, and occupation
- Relationship types: Self, Father, Mother, Spouse, Son, Daughter, and more
- Each member gets a color-coded avatar card
- Income, expenses, and investments can be assigned to individual members

## 11. Period & Financial Year Filtering
All pages respect a global filter so data stays in context.
- Filter by period: last 1 month, 3 months, 6 months, 1 year
- Filter by financial year (e.g., FY 2024–25)
- Switching the filter updates all charts and totals app-wide

## 12. Dark / Light Theme
Toggle between dark and light modes. Preference is persisted across sessions.
