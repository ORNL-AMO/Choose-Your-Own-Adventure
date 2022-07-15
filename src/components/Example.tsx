import React, { useState } from "react";
import Pie, { ProvidedProps, PieArcDatum } from "@visx/shape/lib/shapes/Pie";
import { scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { GradientPinkBlue } from "@visx/gradient";
import { animated, useTransition, to as interpolate } from "@react-spring/web";

export interface LetterFrequency {
	letter: string;
	frequency: number;
}

const letterFrequency: LetterFrequency[] = [
	{ letter: 'A', frequency: 0.08167 },
	{ letter: 'B', frequency: 0.01492 },
	{ letter: 'C', frequency: 0.02782 },
	{ letter: 'D', frequency: 0.04253 },
	{ letter: 'E', frequency: 0.12702 },
	{ letter: 'F', frequency: 0.02288 },
	{ letter: 'G', frequency: 0.02015 },
	{ letter: 'H', frequency: 0.06094 },
	{ letter: 'I', frequency: 0.06966 },
	{ letter: 'J', frequency: 0.00153 },
	{ letter: 'K', frequency: 0.00772 },
	{ letter: 'L', frequency: 0.04025 },
	{ letter: 'M', frequency: 0.02406 },
	{ letter: 'N', frequency: 0.06749 },
	{ letter: 'O', frequency: 0.07507 },
	{ letter: 'P', frequency: 0.01929 },
	{ letter: 'Q', frequency: 0.00095 },
	{ letter: 'R', frequency: 0.05987 },
	{ letter: 'S', frequency: 0.06327 },
	{ letter: 'T', frequency: 0.09056 },
	{ letter: 'U', frequency: 0.02758 },
	{ letter: 'V', frequency: 0.00978 },
	{ letter: 'W', frequency: 0.0236 },
	{ letter: 'X', frequency: 0.0015 },
	{ letter: 'Y', frequency: 0.01974 },
	{ letter: 'Z', frequency: 0.00074 },
];

interface Browsers {
	date: string;
	'Google Chrome': string;
	'Internet Explorer': string;
	Firefox: string;
	Safari: string;
	'Microsoft Edge': string;
	Opera: string;
	Mozilla: string;
	'Other/Unknown': string;
}

const browserUsage: Browsers[] = [
	{
		date: '2015 Jun 15',
		'Google Chrome': '48.09',
		'Internet Explorer': '24.14',
		Firefox: '18.82',
		Safari: '7.46',
		'Microsoft Edge': '0.03',
		Opera: '1.32',
		Mozilla: '0.12',
		'Other/Unknown': '0.01',
	},
	{
		date: '2015 Jun 16',
		'Google Chrome': '48',
		'Internet Explorer': '24.19',
		Firefox: '18.96',
		Safari: '7.36',
		'Microsoft Edge': '0.03',
		Opera: '1.32',
		Mozilla: '0.12',
		'Other/Unknown': '0.01',
	},
	{
		date: '2015 Jun 17',
		'Google Chrome': '47.87',
		'Internet Explorer': '24.44',
		Firefox: '18.91',
		Safari: '7.27',
		'Microsoft Edge': '0.03',
		Opera: '1.36',
		Mozilla: '0.12',
		'Other/Unknown': '0.01',
	},
];

// data and types
type BrowserNames = string;

interface BrowserUsage {
	label: BrowserNames;
	usage: number;
}

const letters: LetterFrequency[] = letterFrequency.slice(0, 4);
const browserNames = Object.keys(browserUsage[0]).filter(
	(k) => k !== "date"
) as BrowserNames[];
const browsers: BrowserUsage[] = browserNames.map((name) => ({
	label: name,
	usage: Number(browserUsage[0][name])
}));

// accessor functions
const usage = (d: BrowserUsage) => {
	console.log(d);
	return d.usage;
};

// color scales
const getBrowserColor = scaleOrdinal({
	domain: browserNames,
	range: [
		"rgba(0,0,0,0.7)",
		"rgba(0,0,0,0.6)",
		"rgba(0,0,0,0.5)",
		"rgba(0,0,0,0.4)",
		"rgba(0,0,0,0.3)",
		"rgba(0,0,0,0.2)",
		"rgba(0,0,0,0.1)"
	]
});

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export type PieProps = {
	width: number;
	height: number;
	margin?: typeof defaultMargin;
	animate?: boolean;
};

export default function Example({
	width,
	height,
	margin = defaultMargin,
	animate = true
}: PieProps) {
	const [selectedBrowser, setSelectedBrowser] = useState<string | null>(null);
	if (width < 10) return null;

	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	const radius = Math.min(innerWidth, innerHeight) / 2;
	const centerY = innerHeight / 2;
	const centerX = innerWidth / 2;
	const donutThickness = 50;

	return (
		<svg width={width} height={height}>
			{/* <GradientPinkBlue id="visx-pie-gradient" /> */}
			<rect
				rx={14}
				width={width}
				height={height}
				fill="url('#visx-pie-gradient')"
			/>
			<Group top={centerY + margin.top} left={centerX + margin.left}>
				<Pie
					data={
						[
							{
								label: 'Foo',
								value: 0.5,
							},
							{
								label: 'Bar',
								value: 0.5,
							}
						]
					}
					pieValue={(item) => item.value}
					outerRadius={radius}
					innerRadius={radius - donutThickness}
					cornerRadius={3}
					padAngle={0.005}
					endAngle={Math.PI/2}
					startAngle={Math.PI/-2}
				>
					{(pie) => (
						<AnimatedPie
							{...pie}
							animate={animate}
							getKey={(arc) => arc.data.label}
							onClickDatum={({ data: { label } }) =>
								animate &&
								setSelectedBrowser(
									selectedBrowser && selectedBrowser === label ? null : label
								)
							}
							getColor={(arc) => getBrowserColor(arc.data.label)}
						/>
					)}
				</Pie>
				{/* <Pie
          data={
            selectedAlphabetLetter
              ? letters.filter(
                  ({ letter }) => letter === selectedAlphabetLetter
                )
              : letters
          }
          pieValue={frequency}
          pieSortValues={() => -1}
          outerRadius={radius - donutThickness * 1.3}
        >
          {(pie) => (
            <AnimatedPie<LetterFrequency>
              {...pie}
              animate={animate}
              getKey={({ data: { letter } }) => letter}
              onClickDatum={({ data: { letter } }) =>
                animate &&
                setSelectedAlphabetLetter(
                  selectedAlphabetLetter && selectedAlphabetLetter === letter
                    ? null
                    : letter
                )
              }
              getColor={({ data: { letter } }) =>
                getLetterFrequencyColor(letter)
              }
            />
          )}
        </Pie> */}
			</Group>
			{animate && (
				<text
					textAnchor="end"
					x={width - 16}
					y={height - 16}
					fill="white"
					fontSize={11}
					fontWeight={300}
					pointerEvents="none"
				>
					Click segments to update
				</text>
			)}
		</svg>
	);
}

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
	// enter from 360° if end angle is > 180°
	startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
	endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
	opacity: 0
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
	startAngle,
	endAngle,
	opacity: 1
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
	animate?: boolean;
	getKey: (d: PieArcDatum<Datum>) => string;
	getColor: (d: PieArcDatum<Datum>) => string;
	onClickDatum: (d: PieArcDatum<Datum>) => void;
	delay?: number;
};

function AnimatedPie<Datum>({
	animate,
	arcs,
	path,
	getKey,
	getColor,
	onClickDatum
}: AnimatedPieProps<Datum>) {
	const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
		from: animate ? fromLeaveTransition : enterUpdateTransition,
		enter: enterUpdateTransition,
		update: enterUpdateTransition,
		leave: animate ? fromLeaveTransition : enterUpdateTransition,
		keys: getKey
	});
	return transitions((props, arc, { key }) => {
		const [centroidX, centroidY] = path.centroid(arc);
		const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

		return (
			<g key={key}>
				<animated.path
					// compute interpolated path d attribute from intermediate angle values
					d={interpolate(
						[props.startAngle, props.endAngle],
						(startAngle, endAngle) =>
							path({
								...arc,
								startAngle,
								endAngle
							})
					)}
					fill={getColor(arc)}
					onClick={() => onClickDatum(arc)}
					onTouchStart={() => onClickDatum(arc)}
				/>
				{hasSpaceForLabel && (
					<animated.g style={{ opacity: props.opacity }}>
						<text
							fill="white"
							x={centroidX}
							y={centroidY}
							dy=".33em"
							fontSize={9}
							textAnchor="middle"
							pointerEvents="none"
						>
							{getKey(arc)}
						</text>
					</animated.g>
				)}
			</g>
		);
	});
}
