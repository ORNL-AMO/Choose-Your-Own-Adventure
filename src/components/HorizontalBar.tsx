import React from 'react';
import { BarStackHorizontal } from '@visx/shape';
import type { SeriesPoint } from '@visx/shape/lib/types';
import { Group } from '@visx/group';
import { AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { LegendOrdinal } from '@visx/legend';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { PureComponentIgnoreFuncs } from '../functions-and-types';

type BarChartKeys = 'Finances available' | 'Money spent';

export type BarStackHorizontalProps = {
	width: number;
	height: number;
	inHeader: boolean;
	margin?: { top: number; right: number; bottom: number; left: number };
	events?: boolean;
	data: [{
		[key in BarChartKeys]: number;
	}]
};

type TooltipData = {
	bar: SeriesPoint<number>;
	key: BarChartKeys;
	index: number;
	height: number;
	width: number;
	x: number;
	y: number;
	color: string;
};

const green1 = '#208030';
const green2 = '#20c030';
const green3 = '#40c03080';
const black = '#000000';

type Margin = {
	top: number; left: number; right: number; bottom: number;
}

const defaultMargin = { top: 40, left: 50, right: 40, bottom: 40 };

const keys = ['Finances available', 'Money spent'] as BarChartKeys[];


// accessors
const getYear = (d) => d.date;

const colorScale = scaleOrdinal<BarChartKeys, string>({
	domain: keys,
	range: [green1, green2, green3],
});

interface HorizontalBarPureProps extends BarStackHorizontalProps { //todo
	containerRef: (element: SVGElement | HTMLElement | null) => void;
	margin: Margin;
	inHeader: boolean;
	showTooltip: (args) => void;
	hideTooltip: () => void;
}

/**
 * Renders the Horizontal Bars. This is a sub PureComponent to avoid re-rendering whenever the tooltip appears/disappears.
 */
class HorizontalBarPure extends PureComponentIgnoreFuncs<HorizontalBarPureProps> {
	render() {
		
		const moneyTotals = this.props.data.reduce((allTotals, currentDate) => {
			const totalTemperature = keys.reduce((dailyTotal, k) => {
				dailyTotal += Number(currentDate[k]);
				return dailyTotal;
			}, 0);
			allTotals.push(totalTemperature);
			return allTotals;
		}, [] as number[]);
		
		// scales
		const moneyScale = scaleLinear<number>({
			domain: [0, Math.max(...moneyTotals)],
			nice: false,
		});
		const yearScale = scaleBand<string>({
			domain: this.props.data.map(getYear),
			padding: 0.2,
		});
	
		const xMax = this.props.width - this.props.margin.left - this.props.margin.right;
		const yMax = this.props.height - this.props.margin.top - this.props.margin.bottom;

		moneyScale.rangeRound([0, xMax]);
		yearScale.rangeRound([yMax, 0]);
	
		return (<svg ref={this.props.containerRef} width={this.props.width} height={this.props.height} 
			style={{position: 'relative', top: '15px'}}>
			{/* <rect width={props.width} height={props.height} fill={background} rx={14} /> */}
			<Group top={this.props.margin.top} left={this.props.margin.left}>
				<BarStackHorizontal<any, BarChartKeys>
					data={this.props.data}
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
									onMouseOver={() => {
										const top = bar.y - 10;
										const left = bar.x + bar.width/2;
										this.props.showTooltip({
											tooltipData: bar,
											tooltipTop: top,
											tooltipLeft: left,
										});
									}}
									onMouseOut={this.props.hideTooltip}
								/>
							)),
						)
					}
				</BarStackHorizontal>
				{!this.props.inHeader &&
					<AxisBottom
						top={yMax}
						scale={moneyScale}
						stroke={black}
						tickStroke={black}
						numTicks={4}
						tickFormat={function tickFormat(d) {
							return '$' + d.toLocaleString('en-US')
						}}
						tickLabelProps={() => ({
							fill: black,
							fontSize: 11,
							textAnchor: 'middle',
						})}
					/>
			}
			</Group>
		</svg>);
	}
}

function HorizontalBarWithTooltip (props: BarStackHorizontalProps) {
	
	const margin = props.margin || defaultMargin;
	
	const {
		tooltipData,
		tooltipLeft,
		tooltipTop,
		tooltipOpen,
		showTooltip,
		hideTooltip,
	} = useTooltip<TooltipData>();
	
	// If you don't want to use a Portal, simply replace `TooltipInPortal` below with
	// `Tooltip` or `TooltipWithBounds` and remove `containerRef`
	const { containerRef, TooltipInPortal } = useTooltipInPortal({
		// use TooltipWithBounds
		detectBounds: true,
		// when tooltip containers are scrolled, this will correctly update the Tooltip position
		scroll: true,
	});
	
	return props.width < 10 ? null : (
		<div 
		style={{display: 'inline-block', position: 'relative'}}
		>
			<HorizontalBarPure
				{...props}
				containerRef={containerRef}
				hideTooltip={hideTooltip}
				showTooltip={showTooltip}
				margin={margin}
				inHeader={props.inHeader}
			/>
			<div
				style={{
					position: 'absolute',
					top: '30px',
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					fontSize: '16px',
				}}
				>
				<LegendOrdinal scale={colorScale} direction='row' labelMargin='0 15px 0 0' />
			</div>
			{tooltipOpen && tooltipData && (
			<TooltipInPortal
				// set this to random so it correctly updates with parent bounds
				key={Math.random()}
				top={tooltipTop}
				left={tooltipLeft}
				style={{
					...defaultStyles,
					textAlign: 'center',
					minWidth: 60,
					backgroundColor: 'rgba(0,0,0,0.9)',
					color: 'white',
				}}
			>
				<>
					<div>{tooltipData.key}</div>
					<strong id='whereisthis'>${tooltipData.bar.data[tooltipData.key].toLocaleString('en-US')}</strong>
				</>
			</TooltipInPortal>
			)}
		</div>
	);
}

export default HorizontalBarWithTooltip;