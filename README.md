# 💰 Expense Tracker

A modern, production-quality personal finance tracker built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

---

## Quick Start

```bash
# Install dependencies (already done if you followed setup)
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features

### Expenses Page (`/`)
- **Add expenses** via a form on the left panel with full validation
  - Date picker (cannot select future dates)
  - Dollar amount with `$` prefix
  - Category selector (Food, Transportation, Entertainment, Shopping, Bills, Other)
  - Description field (2–200 chars)
  - Error messages appear per field on blur or submit
- **Edit expenses** — hover over a row, click the pencil icon, and the form switches to edit mode
- **Delete expenses** — hover over a row, click the trash icon; a two-step confirmation appears inline
- **Summary cards** — Total Spending, This Month, This Week, Top Category
- **Search** — full-text search across description and category
- **Filters** (click "Filters" button):
  - Filter by category
  - Date range (from / to)
  - Sort by Date, Amount, or Category (asc/desc)
  - "Clear filters" link resets everything
- **CSV Export** — exports the currently filtered list (or all if no filter active)

### Dashboard Page (`/dashboard`)
- Monthly spending **bar chart** (last 6 months) via Recharts
- Spending by category **donut/pie chart**
- Category **progress bars** with totals and item counts
- Quick stats panel: average expense, this month, this week, top category

### Data persistence
All expenses are stored in **localStorage** — no server, no database needed. Data survives page refreshes and browser restarts. On first load, 15 sample expenses are pre-seeded so the dashboard looks useful right away.

---

## Testing All Features

1. **Add an expense**
   - Fill in the form, leave a required field empty, tab away → validation error appears
   - Fill everything in correctly → click "Add Expense" → item appears at top of list, "✅ Added!" confirmation flashes
   
2. **Edit an expense**
   - Hover over any row → pencil icon appears → click it
   - Form switches to edit mode with pre-filled values
   - Change any field → click "Save Changes"
   - Click "Cancel" to discard changes

3. **Delete an expense**
   - Hover over any row → trash icon appears → click it
   - "Delete? Yes / No" appears inline → click "Yes" to confirm

4. **Search & Filter**
   - Type in the search box to filter by description or category
   - Click "Filters" to expand: filter by category, date range, sort order
   - Filter count badge appears when any filter is active
   - "Clear filters" resets everything

5. **CSV Export**
   - Apply filters if desired, then click "Export CSV"
   - A `.csv` file downloads immediately

6. **Dashboard charts**
   - Navigate to `/dashboard`
   - Bar chart shows monthly totals; pie chart shows category split
   - Progress bars show relative spend per category
   - Quick stats panel summarises averages

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with sticky Navbar
│   ├── globals.css          # Tailwind base styles
│   ├── page.tsx             # Expenses page (/)
│   └── dashboard/
│       └── page.tsx         # Dashboard page (/dashboard)
├── components/
│   ├── Navbar.tsx           # Sticky top navigation
│   ├── CategoryBadge.tsx    # Coloured pill badge per category
│   ├── SummaryCards.tsx     # 4-card stats row
│   ├── ExpenseForm.tsx      # Add / Edit form with validation
│   ├── ExpenseList.tsx      # Filterable list with search, sort, delete, edit
│   └── SpendingCharts.tsx   # Bar + Pie charts, category breakdown
├── hooks/
│   ├── useExpenses.ts       # CRUD + localStorage persistence
│   └── useFilters.ts        # Filter / sort / search state
├── types/
│   └── index.ts             # TypeScript interfaces + constants
└── utils/
    └── index.ts             # Formatting, filtering, stats, CSV, validation, seed data
```

---

## Tech Stack

| Library | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Recharts | Bar / Pie charts |
| date-fns | Date formatting and arithmetic |
| localStorage | Client-side persistence |

---

## Build for Production

```bash
npm run build   # compile and type-check
npm start       # serve the production build
```
