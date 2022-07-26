import React, { useState } from "react";
import { Group } from "@visx/group";
import { Text } from '@visx/text';
import { Arc } from "@visx/shape";
import { animated, to as interpolate, useTransition, } from '@react-spring/web';
import type { ArcProps } from "@visx/shape/lib/shapes/Arc";

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export type GaugeProps = {
	/**
	 * Width of the gauge chart. Height is automatically calculated.
	 */
	width: number;
	/**
	 * Value between 0 and 1. Not normalized.
	 */
	value: number;
	text: string;
	/**
	 * Label at the bottom.
	 */
	label?: string;
	color?: string;
	/**
	 * Font size of the main text. If number, it'll be a multiplier of the default size. If string, it'll be passed straight through.
	 */
	textFontSize?: string | number;
	margin?: typeof defaultMargin;
	animate?: boolean;
};

export default function GaugeChart({
	width,
	margin = defaultMargin,
	value,
	text,
	textFontSize,
	label,
	color,
}: GaugeProps) {
	if (width < 10) return null;

	const height = width / 2 + margin.bottom;
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	const radius = innerWidth / 2;
	const centerY = innerHeight;
	const centerX = innerWidth / 2;
	const donutThickness = radius * 0.25;

	// Handle the different types of font size provided (undefined or string or number)
	const defaultTextFontSize = Math.log(radius / 5) / Math.log(1.5) * 4.5;
	if (typeof textFontSize === 'number') textFontSize *= defaultTextFontSize;
	else if (!textFontSize) textFontSize = defaultTextFontSize;

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
					fill='#ffffff'
				/>
				{/* Filled-in value */}
				<AnimatedArc
					startAngle={-Math.PI / 2}
					endAngle={(datum) => (datum * Math.PI) - Math.PI / 2}
					innerRadius={radius - donutThickness}
					outerRadius={radius}
					fill={color || 'blue'}
					data={value}
				/>
				{/* Big text */}
				<Text
					verticalAnchor="end"
					textAnchor="middle"
					fontSize={textFontSize}
					y={-4}
				>
					{text}
				</Text>
				{/* Label */}
				<Text
					verticalAnchor="start"
					textAnchor="middle"
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