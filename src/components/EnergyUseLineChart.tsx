import Plot from 'react-plotly.js';
import { TrackedStats, getElectricityEmissionsFactor } from '../trackedStats';
import { theme } from './theme';
import React from 'react';

export default function EnergyUseLineChart(props: EnergyUseLineChartProps) {
	const data = [];
	const yearlyStats = [...props.yearRangeInitialStats]
	// remove end of game year
	yearlyStats.pop()
	let xYears: number[] = Array.from(yearlyStats, statYear => {
		return statYear.currentGameYear;
	});
	let xTicks: string[] = Array.from(xYears, year => {
		return 'Year ' + String(year * props.yearRangeInitialStats[0].gameYearInterval);
	});

	let energyTypeYearValues = {
		electricity: [],
		naturalGas: [],
		// landfillGases: [],
	}
	yearlyStats.forEach(statYear => {
		// TODO: This chart previously displayed GHG emissions (kg CO2e) to support the "GHG Reduction" chart title.
		// GHG reduction displays are being replaced with operationEnergyUsePercent per the new stat naming convention.
		// The chart title and y-axis have been updated accordingly; the data below still uses GHG emissions values
		// and should be updated to show energy use in MMBTU (electricityUseKWh * 0.003412 + naturalGasMMBTU) if
		// the intent is to align with the operationEnergyUsePercent metric.
		let electricityEmissions = statYear.electricityUseKWh * getElectricityEmissionsFactor(statYear.currentGameYear, statYear.gameYearInterval, statYear.gameYearDisplayOffset);
		let natGasEmissions = statYear.naturalGasMMBTU * statYear.naturalGasEmissionsPerMMBTU;
		// let landfillGasEmissions = statYear.hydrogenMMBTU * statYear.hydrogenEmissionsPerMMBTU;
		energyTypeYearValues.electricity.push(electricityEmissions);
		energyTypeYearValues.naturalGas.push(natGasEmissions);
		// energyTypeYearValues.landfillGases.push(landfillGasEmissions);
	});

    data.push({
        x: xYears,
        y: energyTypeYearValues.electricity,
        mode: 'lines+markers',
        name: 'Electricity',
        line: {
            shape: 'linear',
            color: theme.palette.warning.main,
            width: 2
        },
        type: 'scatter'
    },
    {
        x: xYears,
        y: energyTypeYearValues.naturalGas,
        mode: 'lines+markers',
        name: 'Natural Gas',
        line: {
            shape: 'linear',
            color: theme.palette.primary.dark,
            width: 2
        },
        type: 'scatter'
    },
                        {/* 8213 */}

    // {
    //     x: xYears,
    //     y: energyTypeYearValues.landfillGases,
    //     mode: 'lines+markers',
    //     name: 'Landfill Gases',
    //     line: {
    //         shape: 'linear',
    //         color:  '#f06807',
    //         width: 2
    //     },
    //     type: 'scatter'
    // },
    )

	const layout = {
		width: props.parentElement.width,
		title: {
			text: `${xYears.length * props.yearRangeInitialStats[0].gameYearInterval} Year Energy Use`,
			font: {
				family: 'Roboto',
				size: 24
			},
			xref: 'paper',
			x: 0.05,
		},
		xaxis: {
			showgrid: false,
			autorange: false,
			zeroline: false,
			automargin: true,
			standoff: 25,
			tickvals: xYears,
			ticktext: xTicks,
			tickangle: -60,
			range: [1, xYears.length],
			tickmode: 'array',
		},
		yaxis: {
			title: 'Energy Use (MMBtu)',
			showline: false,
			automargin: true,
			standoff: 25,
		},
		legend: {
			y: 0.5,
			traceorder: 'reversed',
			font: { size: 16 },
			yref: 'paper',
		},
	};

	return (
		<Plot
			data={data}
			layout={layout}
		/>
	);
}

interface EnergyUseLineChartProps {
    yearRangeInitialStats: TrackedStats[], 
    parentElement: any
}
