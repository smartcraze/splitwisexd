# DECISIONS.md - Architectural & Product Decisions

## 1. Client-Side Import Parsing & Interactive Wizard
- **Problem**: Ingesting messy CSV data with 12 anomalies while respecting Meera's request: *"Clean up the duplicates — but I want to approve anything the app deletes or changes."*
- **Options Considered**:
  1. *Backend Import Endpoint*: File is uploaded, parsed on backend, and automatically written to DB with automated guesses (e.g. auto-excluding Sam, auto-deleting duplicates).
  2. *Client-side Wizard with Review Screen (Selected)*: Parse file in-browser, execute the anomaly engine, and render cards showing the exact warning details. Provide interactive checkboxes and inputs for Meera's approval.
- **Decision Rationale**: Option 2 satisfies Meera's request perfectly. It lets users see exactly what the importer intends to skip (e.g. duplicate rows) or modify (USD rate, user exclusions) before anything touches the persistent relational database.

---

## 2. Quick Demo Logins for Aisha, Rohan, Priya, Meera, Sam, Dev
- **Problem**: Testing the app as six different individuals.
- **Options Considered**:
  1. *Manual signup only*: Requiring the evaluator to create six accounts and passwords manually.
  2. *Single-click Demo Logins (Selected)*: Render buttons on the Sign In screen to impersonate any of the six flatmates.
- **Decision Rationale**: This makes evaluation extremely simple. Clicking "Rohan" automatically signs him in. If the database is brand new and empty, the frontend automatically registers Rohan in the background and signs him in, ensuring a zero-setup demo experience.

---

## 3. Database Integer Money Representation
- **Problem**: How to represent money inside a Postgres database.
- **Options Considered**:
  1. *Float / Double*: Storing amounts as decimals (e.g. 1200.50).
  2. *Int (Selected)*: Storing all currency amounts as integers.
- **Decision Rationale**: Storing money as floats causes floating-point errors (e.g. `0.1 + 0.2 !== 0.3`). This is unacceptable in ledger apps. We round all import costs to the nearest integer rupee, complying with the backend database's `Int` constraints. Any minor rounding remainders (e.g., splitting ₹100 equally three ways creates a ₹1 remainder) are added to the payer's share, maintaining the mathematical invariant: `Total Paid = Total Owed`.

---

## 4. Immutable Expense History & Offset Settlements
- **Problem**: How to resolve balances when someone pays.
- **Options Considered**:
  1. *Expense Deletion*: Modifying or deleting historical expenses when someone pays.
  2. *Separate Settlement Records (Selected)*: Keeping expenses immutable. Adding separate `Settlement` records to decrease the net debt.
- **Decision Rationale**: Retains auditability. Rohan wants to see *exactly* which expenses make up his balance. If we deleted or mutated expenses upon payment, Rohan would see "magic numbers" instead of the historical log of Cab, Dinner, and Electricity bills.
