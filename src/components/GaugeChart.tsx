import React, { useState } from 'react';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { Arc } from '@visx/shape';
import { animated, to as interpolate, useTransition, } from '@react-spring/web';
import type { ArcProps } from '@visx/shape/lib/shapes/Arc';

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export type Tick = {
	value: number;
	label: string;
}

export type GaugeProps = {
	/**
	 * Width of the gauge chart. Height is automatically calculated.
	 */
	width: number;
	/**
	 * Value between 0 and 1. Not normalized.
	 */
	value1: number;
	value2?: number;
	text: string;
	/**
	 * Label at the bottom.
	 */
	label?: string;
	/**
	 * Fill color of the background (default: white)
	 */
	backgroundColor?: string;
	/**
	 * Fill color of the chart
	 */
	color1?: string;
	color2?: string;
	/**
	 * Font size of the main text. If number, it'll be a multiplier of the default size. If string, it'll be passed straight through.
	 */
	textFontSize?: string | number;
	/**
	 * todo doc
	 */
	ticks?: Tick[];
	margin?: typeof defaultMargin;
	animate?: boolean;
};

export default function GaugeChart({
	width,
	margin = defaultMargin,
	value1,
	value2,
	text,
	textFontSize,
	label,
	color1,
	color2,
	ticks,
	backgroundColor,
}: GaugeProps) {
	if (width < 10) return null;

	const height = width / 2 + margin.bottom;
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	const radius = innerWidth / 2;
	const centerY = innerHeight;
	const centerX = innerWidth / 2;
	const donutThickness = radius * 0.25;
	const tickThickness = 5;
	const tickRadius = radius + tickThickness;

	// Handle the different types of font size provided (undefined or string or number)
	const defaultTextFontSize = Math.log(radius / 5) / Math.log(1.5) * 4.5;
	if (typeof textFontSize === 'number') textFontSize *= defaultTextFontSize;
	else if (!textFontSize) textFontSize = defaultTextFontSize;
	
	if (!ticks) ticks = [];
	
	const tickArcs = ticks.map((tick, idx) => {
		const value = tick.value;
		// using Math.min(value, 0.995) to prevent the stroke from appearing past the end of the arc
		let tickAngle = ((Math.min(value, 0.995) * Math.PI) - Math.PI / 2);
		
		// let radiusMod = (tick.label.length > 2) ? tickThickness : tickThickness/2; // Move farther away if the string is longer
		
		return (
			<g key={idx}>
				<Arc
					startAngle={tickAngle}
					endAngle={tickAngle}
					// innerRadius={radius - donutThickness - tickThickness}
					// outerRadius={radius - donutThickness}
					innerRadius={radius}
					outerRadius={radius + tickThickness}
					stroke='#00000080'
					strokeWidth={1}
				></Arc>
				<Text
					verticalAnchor='middle'
					textAnchor='middle'
					fontSize={13}
					// x={Math.sin(tickAngle) * (tickRadius + tickThickness * 2)}
					y={1 * -(tickRadius + tickThickness + 2)}
					style={{transform: `rotate(${tickAngle}rad)`}}
				>
					{tick.label}
				</Text>
			</g>
		);
	});
	
	// we need to make sure the smaller value appears behind the larger value, so figure out the order programmatically
	let arc1, arc2, smallerArc, largerArc;
	
	arc1 = <AnimatedArc
		startAngle={-Math.PI / 2}
		endAngle={(datum) => (datum * Math.PI) - Math.PI / 2}
		innerRadius={radius - donutThickness}
		outerRadius={radius}
		fill={color1 || 'blue'}
		data={value1}
	/>;
	
	if (typeof value2 !== 'undefined') {
		arc2 = <AnimatedArc
			startAngle={-Math.PI / 2}
			endAngle={(datum) => (datum * Math.PI) - Math.PI / 2}
			innerRadius={radius - donutThickness}
			outerRadius={radius}
			fill={color2 || 'blue'}
			data={value2}
		/>;
		
		// Assign larger/smaller arc as necessary
		if (value1 < value2) {
			smallerArc = arc1;
			largerArc = arc2;
		}
		else {
			smallerArc = arc2;
			largerArc = arc1;
		}
	}
	// If we only have ONE arc
	else {
		smallerArc = arc1;
	}

	return (
		<svg width={width} height={height}>
			<rect
				rx={14}
				width={width}
				height={height}
				fill="url('#visx-pie-gradient')"
			/>
			<Group top={centerY + margin.top} left={centerX + margin.left}>
				{/* Base */}
				<Arc
					startAngle={-Math.PI / 2}
					endAngle={Math.PI / 2}
					innerRadius={radius - donutThickness}
					outerRadius={radius}
					fill={backgroundColor || '#ffffff'}
				/>
				{/* Filled-in value 2 (BEHIND value 1) */}
				{largerArc}
				{/* Filled-in value 1 */}
				{smallerArc}
				{/* Big text */}
				<Text
					verticalAnchor='end'
					textAnchor='middle'
					fontSize={textFontSize}
					y={-4}
				>
					{text}
				</Text>
				{tickArcs}
				{/* Label */}
				<Text
					verticalAnchor='start'
					textAnchor='middle'
					y={8}
					fontSize='0.9rem'
					fontWeight={200}
					className='i'
				>
					{label}
				</Text>
			</Group>
		</svg>
	);
}

type AnimatedArcProps = ArcProps<number> & {
	startAngle: ResolvableGeneric<number>,
	endAngle: ResolvableGeneric<number>,
	innerRadius: ResolvableGeneric<number>,
	fill: string,
	data: number;
}

function AnimatedArc({startAngle, endAngle, innerRadius, outerRadius, fill, data}: AnimatedArcProps) {
	
	const [value] = useState(data);
	
	const transitions = useTransition(value, {
		initial: {val: 0},
		from: {val: 0},
		enter: {val: data}, // When it's first rendered, I think?
		update: {val: data}, // When the data is updated
		delay: 200, // Delay before animating
	});
	
	return (<Arc
		{...{startAngle, endAngle, innerRadius, outerRadius, fill, data}}
	>
		{(arc) => {
			return transitions((props) => {
				return (<animated.path
					d={interpolate([props.val], (val) => arc.path(val))}
					fill={fill}
				/>);
			});
		}}
	</Arc>);
}