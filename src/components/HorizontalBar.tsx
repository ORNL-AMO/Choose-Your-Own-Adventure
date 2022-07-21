import React from 'react';
import { BarStackHorizontal } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { LegendOrdinal } from '@visx/legend';

type BarChartKeys = 'Finances available' | 'Rebates' | 'Money spent';

export type BarStackHorizontalProps = {
	width: number;
	height: number;
	margin?: { top: number; right: number; bottom: number; left: number };
	events?: boolean;
};

const green1 = '#208030';
const green2 = '#20c030';
const green3 = '#40c03080';
const black = '#000000';

const defaultMargin = { top: 40, left: 50, right: 40, bottom: 40 };

// const data = cityTemperature.slice(0, 1);
const data = [
	{
		year: 1,
		'Finances available': 100_000,
		'Rebates': 5_000,
		'Money spent': 65_000,
	}
];

const keys = Object.keys(data[0]).filter((d) => d !== 'year') as BarChartKeys[];

const moneyTotals = data.reduce((allTotals, currentDate) => {
	const totalTemperature = keys.reduce((dailyTotal, k) => {
		dailyTotal += Number(currentDate[k]);
		return dailyTotal;
	}, 0);
	allTotals.push(totalTemperature);
	return allTotals;
}, [] as number[]);

// accessors
const getYear = (d) => d.date;

// scales
const moneyScale = scaleLinear<number>({
	domain: [0, Math.max(...moneyTotals)],
	nice: true,
});
const yearScale = scaleBand<string>({
	domain: data.map(getYear),
	padding: 0.2,
});
const colorScale = scaleOrdinal<BarChartKeys, string>({
	domain: keys,
	range: [green1, green2, green3],
});


function HorizontalBar (props: BarStackHorizontalProps) {
	
	const margin = props.margin || defaultMargin;
	
	const xMax = props.width - margin.left - margin.right;
	const yMax = props.height - margin.top - margin.bottom;

	moneyScale.rangeRound([0, xMax]);
	yearScale.rangeRound([yMax, 0]);

	return props.width < 10 ? null : (
		<div>
			<svg width={props.width} height={props.height}>
				{/* <rect width={props.width} height={props.height} fill={background} rx={14} /> */}
				<Group top={margin.top} left={margin.left}>
					<BarStackHorizontal<any, BarChartKeys>
						data={data}
						keys={keys}
						height={yMax}
						y={getYear}
						xScale={moneyScale}
						yScale={yearScale}
						color={colorScale}
					>
						{(barStacks) =>
							barStacks.map((barStack) =>
								barStack.bars.map((bar) => (
									<rect
										key={`barstack-horizontal-${barStack.index}-${bar.index}`}
										x={bar.x}
										y={bar.y}
										width={bar.width}
										height={bar.height}
										fill={bar.color}
									/>
								)),
							)
						}
					</BarStackHorizontal>
					<AxisBottom
						top={yMax}
						scale={moneyScale}
						stroke={black}
						tickStroke={black}
						numTicks={2}
						tickLabelProps={() => ({
							fill: black,
							fontSize: 11,
							textAnchor: 'middle',
						})}
					/>
				</Group>
			</svg>
			<div
				style={{
					position: 'absolute',
					top: margin.top / 2 - 10,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					fontSize: '14px',
				}}
			>
				<LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" />
			</div>
		</div>
	);
}

export default HorizontalBar;
