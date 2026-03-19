export const EnergyTabCategories = {
    GROUP_A: {
        // previously named scope 1
        title: 'Fuels',
        choiceText: 'Reduce energy use from on-site fuel combustion',
        infoBody: 'Projects targeting natural gas and other on-site fuel use.',
        projectsPageTitle: (companyName: string) =>
            `These are the possible {Fuels} projects {${companyName}} can do this budget period.`,
    },
    GROUP_B: {
        // previously named scope 2
        title: 'Electricity',
        choiceText: 'Reduce energy use from purchased electricity',
        infoBody: 'Projects targeting purchased electricity and on-site power generation.',
        projectsPageTitle: (companyName: string) =>
            `These are the possible {Electricity} projects {${companyName}} can do this budget period.`,
    },
};
