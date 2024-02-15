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
- Implementation applies energy savings immediately. Savings remain for all subsequent game years, **Except savings from projects w/ Related Maintenance**. 

### Normal (Non-Renewable):
- **!!!!** Projects implemented in previous years become Completed Projects (in Year Recap) after the implementation year.

### Normal (Non-Renewable) W/ Related Maintenance:
- energy savings apply for the year implemented, but don't last for subsequent years. Savings may come back with a related project (see below)
- **Example** Scope 2 - Small Carport Solar Installation reveals Carport Solar - Maintenance

### Renewable:
- Are auto-implemented in all years following implementation. Can be unimplemented at any time to remove energy savings and costs 
- Project cost is deducted from the budget at the start of each year it is renewed
- Year Recap project recap cards will only be displayed in the implementation year, unless the project was financed.
- **Example** Scope 2 - Mid-sized Solar PPPA


### Maintenance Renewable:
- Becomes available when it's parent/dependant is implemented. 
- **Example** Scope 2 - Small Carport Solar Installation reveals Carport Solar - Maintenance

---
## Financing 
At game start, players select the year that financing options should appear (years 1-5), and which options should be available, including: Xaas, Loan, Green Bonds. Currently, only one financing option is available per project.

Players will be awarded Capital Funding rewards for reaching savings milestones (30% and 50%) throughout the game. Each Capital Funding reward can be used to implement a project for free (excluding VPPA's). 

- Financed project recap cards appear at Year Recap for each year until they are paid in full. They are then part of Completed Projects. Financed Renewables will continue to appear at year recap.
- Financed normal non-renewables can't be unimplemented after the implementation year
- Financed Projects un-implemented from the Scopes page will have their implement button disabled. Player must select financing option from the project info dialog.

##### Dev notes:
Capital Funding pays the project in full but is still considered a financing type for purposes of game state/logic

---
## Year Recap

### Current Projects list
**!!!!** Shows implemented projects, renewables projects, and any financed projects currently being paid on

### Completed Projects (Below graphs)
Shows completed projects after their implementation year, as well non-renewable financed projects.

### Hidden and Rebates





