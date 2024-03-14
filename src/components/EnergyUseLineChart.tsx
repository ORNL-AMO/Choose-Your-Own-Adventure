import Plot from 'react-plotly.js';
import { TrackedStats, getElectricityEmissionsFactor } from '../trackedStats';
import { theme } from './theme';
import React from 'react';

export default function EnergyUseLineChart(props: EnergyUseLineChartProps) {
	const data = [];
	let xYears: number[] = Array.from([...props.yearRangeInitialStats], statYear => statYear.currentGameYear);
	let xTicks: string[] = Array.from(xYears, year => {
		return 'Year ' + String(year);
	});

	let energyTypeYearValues = {
		electricity: [],
		naturalGas: [],
		landfillGases: [],
	}
	props.yearRangeInitialStats.forEach(statYear => {
		let electricityEmissions = statYear.electricityUseKWh * getElectricityEmissionsFactor(statYear.currentGameYear, statYear.gameYearInterval, statYear.gameYearDisplayOffset);
		let natGasEmissions = statYear.naturalGasMMBTU * statYear.naturalGasEmissionsPerMMBTU;
		let landfillGasEmissions = statYear.hydrogenMMBTU * statYear.hydrogenEmissionsPerMMBTU;
		energyTypeYearValues.electricity.push(electricityEmissions);
		energyTypeYearValues.naturalGas.push(natGasEmissions);
		energyTypeYearValues.landfillGases.push(landfillGasEmissions);
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
    {
        x: xYears,
        y: energyTypeYearValues.landfillGases,
        mode: 'lines+markers',
        name: 'Landfill Gases',
        line: {
            shape: 'linear',
            color:  '#f06807',
            width: 2
        },
        type: 'scatter'
    },
    )

	const layout = {
		width: props.parentElement.width,
		title: {
			text: `${xYears.length} Year GHG Reduction`,
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
			title: 'GHG Emissions (kg CO<sub>2</sub>e)',
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
