# Gameplay Mechanics, rules, logic, 

**!!!!** - symbol denotes functionality that may need fixed/enhanced, or has an issue on the board

## General

- The game is played in 1 or 2 year budget periods (intervals)
- Players may move backwards a single budget period to make changes.
- Players receive additional budget at each year start
	- 1 year: $75,000
	- 2 year: $150,000


----

## Project Types and Behavior
### All Types:
- May be implemented and un-implemented in the implementation year
- Implementation applies energy savings immediately. Savings remain for all subsequent game years.

### Normal (Non-Renewable):
- **!!!!** Projects implemented in previous years become Completed Projects (in Year Recap) after the implementation year.

### Renewable:
- Are auto-implemented in all years following implementation. Can be unimplemented at any time to remove energy savings and costs 
- Project cost is deducted from the budget at the start of each year it is renewed
- Year Recap project recap cards will only be displayed in the implementation year, unless the project was financed.
- **Example** Scope 2 - Mid-sized Solar PPPA

---
## Financing 
At game start, players select the year that financing options should appear (years 1-5), and which options should be available, including: Xaas, Loan, Green Bonds. Currently, only one financing option is available per project.

Players will be awarded Capital Funding rewards (one free project) for reaching savings milestones of 15% and 40% throughout the game. Each Capital Funding reward must be used in the following year. VPPA projects are ineligible. 

- Financed project recap cards appear at Year Recap for each year until they are paid in full. They are then part of Completed Projects. Financed Renewables will continue to appear at year recap.
- Financed normal non-renewables can't be unimplemented after the implementation year
- Financed Projects un-implemented from the Scopes page will have their implement button disabled. Player must select financing option from the project info dialog.

---
## Year Recap

### Current Projects list
**!!!!** Shows implemented projects, renewables projects, and any financed projects currently being paid on

### Completed Projects (Below graphs)
Shows completed projects after their implementation year, as well non-renewable financed projects.

### Hidden and Rebates


## Other
When players move backward one year, their project implementation choices, savings, and budget reflect that year's state prior to Year Recap



---

## Notes for Development

## Important notes, caveats, architecture, improvement opportunities

#### Project Tracking

Implemented renewable projects (any funding type) are added to implementedRenewableProjects as an ImplementedProject object - they are NOT added to `implementedFinancedProjects` and `implementedProjectIds` like other normal projects. 

All normal projects are now added to `implementedFinancedProjects` and `implementedProjectIds`. This should eventually be refactored to drop implementedProjectIds


Capital Funding pays projects in full and has it's own state object, but is also considered a financing type so that the feature can follow the app's pattern for project implementation. 

#### Opportunities

Implemented projects are being added to a number of arrays to track state between years, including implementedProjectIds, implementedFinancedProjects, implementedRenewableProjects, and so on. This was done to stay within existing app patterns. We should refactor for a single source of truth where implemented project objects have knowledge of their own state.






