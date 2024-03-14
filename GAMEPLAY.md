# Gameplay Mechanics, rules, logic, 

**!!!!** - symbol denotes functionality that may need fixed/enhanced, or has an issue on the board

## General

- The game is played in 1 or 2 year budget periods (intervals)
- Players may move backwards a single budget period to make changes.
- Players receive additional budget at each year start:
	1: 75_000,
	2: 75_000,
	3: 75_000,
	4: 75_000,
	5: 75_000,
	6: 112_500,
	7: 112_500,
	8: 112_500,
	9: 112_500,
	10: 112_500

- Yearly emissions factor defaults are used to calculate emissions. For 2 year gameplay the later year is used (i.e. year 4 in 3/4)
	1: .371,
	2: .358,
	3: .324,
	4: .311,
	5: .305,
	6: .302,
	7: .300,
	8: .291,
	9: .285,
	10: .276

- When players move backward one year, their project implementation choices, savings, and budget reflect that year's state prior to Year Recap

----

## Project Types and Behavior
### All Types:
- May be implemented and un-implemented in the implementation year
- Energy savings from implementation are applied immediately and remain for all subsequent game years. 
- **!!!!** Energy cost-savings from implementation are applied to the next year budget. This can be changed in game settings, where 'always' allows cost-savings to carryover every subsequent year, i.e. $5k savings from project X carries over to year 2, $5k savings carries over to year 3, etc...

### Normal (Non-Renewable):
- Projects implemented in previous years become Completed Projects (in Year Recap) after the implementation year.

### Bundled/Unbundled RECs (Renewable):
- Are auto-renewed in all years following implementation.
- Project cost is deducted from the budget at the start of each year it is renewed (twice if 2 year gameplay), **Except one-time payment projects**.
- Year Recap project recap cards will only be displayed in the implementation year, unless the project was financed.

	###### Annual Financing Only projects:
	Only become available in the selected financing start year and when their financing option is selected at game start
	- Mid-Sized Solar, Community Wind, Utility-PPPA Wind

	###### One-time Payment Renewables:
	Can be paid for once (or financed), regardless of 1 or 2 year gameplay, and are renewed each year
	- Solar Panels Carport, Rooftop mid-sized Solar

	###### Power Purchase Agreements (PPA):
	Are paid for annually over a 10-year term. This is a special payment type and should not be included in most of the gameplay mechanisms and logic related to financing.

	###### Always Carryover cost Savings:
	**!!!!** Regardless of game settings, these projects carryover cost savings every year
	- Small solar carport, Rooftop mid-sized Solar, Community Wind


---
## Financing 
At game start, players select the year that financing options should appear (years 1-5), and which options should be available, including: EaaS, Loan, Green Bonds. Currently, only one financing option is available per project.

- Financed project recap cards appear at Year Recap for each year until they are paid in full. They are then part of Completed Projects. Financed Renewables will continue to appear at year recap.
- Financed normal non-renewables can't be unimplemented after the implementation year
- Financed Projects un-implemented from the Scopes page will have their implement button disabled. Player must select financing option from the project info dialog.

---
## Year Recap

### Current Projects list
**!!!!** Shows projects implemented in the current year as well as renewables projects, and any financed projects currently in repayment

### Completed Projects (Below graphs)
Shows completed projects after their implementation year, as well non-renewable financed projects.

### Hidden Costs and Rebates
Are only applied in the first year that the project is implemented.

### Capital Funding Rewards
Players will be awarded Capital Funding rewards (one free project) for reaching savings milestones of 5% and 35% throughout the game. Each Capital Funding reward must be used in the following new year. PPA projects are ineligible. 

---

## Notes for Development

## Important notes, caveats, architecture, improvement opportunities

#### Project Tracking

Implemented renewable projects (any funding type) are added to implementedRenewableProjects as an ImplementedProject object - they are NOT added to `implementedFinancedProjects` and `implementedProjectIds` like other normal projects. 

All normal projects are now added to `implementedFinancedProjects` and `implementedProjectIds`. This should eventually be refactored to drop implementedProjectIds

Capital Funding pays projects in full and has it's own state object, but is also considered a financing type so that the feature can follow the app's pattern for project implementation. 

#### Opportunities

Implemented projects are being added to a number of arrays to track state between years, including implementedProjectIds, implementedFinancedProjects, implementedRenewableProjects, and so on. This was done to stay within existing app patterns. We should refactor for a single source of truth where implemented project objects have knowledge of their own state.






