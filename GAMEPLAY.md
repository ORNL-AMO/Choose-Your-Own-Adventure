# Gameplay Mechanics, rules, logic, 

**!!!!** - symbol denotes functionality that may need fixed/enhanced

## General

- Players may move backwards a single year to make changes.



----

## Project Types and Behavior
### All Types:
- May be implemented and un-implemented in a given year
- Implementation applies energy savings immediately, which lasts for all subsequent game years.

### Normal (Non-Renewable):
- Projects implemented in previous years become Completed Projects (Year Recap)

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


- Financed project recap cards appear at Year Recap for each year until they are paid in full. They are then part of Completed Projects
- Financed Projects un-implemented from the Scopes page will have their implement button disabled. Player must select financing option from the project info dialog.


---
## Year Recap

### Current Projects
**!!!!** Shows implemented projects, renewables in first year of implementation, and any financed projects currently being paid on

### Completed Projects (Below graphs)
Show any non-financed projects after their implementation year.

### Hidden costs and Surprises

### Rebates








<!-- ### Implementing projects

1. Create a new Page symbol for the project in `Pages.tsx`.
2. Add it to either `Scope1Projects` or `Scope2Projects`, depending on which scope it's in.
3. Create the new project in `Projects.tsx`. See the documentation on `ProjectControlParams` for info on the necessary parameters.
```js
Projects[Pages.myNewProject] = new ProjectControl({
	pageId: Pages.myNewProject,
	cost: 50_000,
	...
});
```
4. In the newGroupedChoicesControl parameters for `PageControls[Pages.scope1Projects]`, add `Projects[Pages.myNewProject].getProjectChoiceControl()` to the `choices` list of one of the `groups`.
### Oak Ridge National Laboratory staff

- Gina Accawi
- Kristina Armstrong
- Paulomi Nandy
- Sachin Nimbalkar
- Thomas Wenning -->