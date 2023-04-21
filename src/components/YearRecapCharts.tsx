import React, { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientTealBlue } from '@visx/gradient';
import letterFrequency from '@visx/mock-data/lib/mocks/letterFrequency';
import type { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';
import { scaleBand, scaleLinear } from '@visx/scale';
import type { TrackedStats } from '../trackedStats';
import { AxisBottom, AxisLeft, AxisTop } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';

const data = letterFrequency.slice(5);
const verticalMargin = 120;
const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };
// accessors
const getLable = (d: BarData) => d.dataLables;
const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;

export type BarsProps = {
    barGraphData: number[];
    width: number;
    height: number;
    totalIterations: number;
    graphTitle: string;
    unitLable: string;
    events?: boolean;
};

export default function Example(props: BarsProps) {
    let graphDataAndLables: BarData[] = [];
    let yearCount: number = 0;
    props.barGraphData.forEach(data => {
        let dataLable: string;
        if (yearCount !== 0) {
            if (props.totalIterations == 5) {
                dataLable = 'Years ' + yearCount + ' and ' + (yearCount + 1);
                yearCount = yearCount + 2;
            } else {
                dataLable = 'Year ' + yearCount;
                yearCount = yearCount + 1;
            }
            graphDataAndLables.push({
                data: data,
                dataLables: dataLable
            });
        } else {
            yearCount++;
        }
        console.log('Bar data ' + data);
    });


    // bounds
    const xMax = props.width;
    const yMax = props.height - verticalMargin;

    // scales, memoize for performance
    const xScale = useMemo(
        () =>
            scaleBand<string>({
                range: [0, xMax],
                round: true,
                domain: graphDataAndLables.map(getLable),
                padding: 0.4,
            }),
        [xMax],
    );
    const yScale = useMemo(
        () =>
            scaleLinear<number>({
                range: [yMax, 0],
                round: true,
                domain: [0, 100],
            }),
        [yMax],
    );

    xScale.range([0, xMax]);
    yScale.range([yMax, 0]);

    return props.width < 10 ? null : (
        <svg width={props.width} height={props.height}>
            <rect x={0} y={0} width={props.width} height={props.height} fill='#c0d0f2' rx={14} />
            <Group top={verticalMargin / 2}>
                {graphDataAndLables.map((d) => {
                    const data = d.dataLables;
                    const barWidth = xScale.bandwidth();
                    const barHeight = yMax - (yScale(d.data) ?? 0);
                    const barX = xScale(data);
                    const barY = yMax - barHeight;
                    return (
                        <>
                            <Bar
                                key={`bar-${data}`}
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                fill='#1D428A'
                                onClick={() => {
                                    if (props.events) alert(`clicked: ${JSON.stringify(Object.values(d))}`);
                                }}
                            />
                            <text x={barX} y={barY - 5} fontSize={12}>
                                {d.data.toFixed(2)} {props.unitLable}
                            </text>
                        </>
                    );
                })}
            </Group>
            {/* <GridRows scale={yScale} width={xMax} height={yMax} stroke='#e0e0e0' /> */}
            <AxisTop 
                top={70}
                scale={xScale}
                hideTicks
                hideAxisLine
                hideZero
                label={props.graphTitle}
                labelProps={{
                    fill: '#1D428A',
                    fontSize: 24,
                    textAnchor: 'middle',
                }}
                tickLabelProps={{
                    fill: '#c0d0f2',
                    fontSize: 0,
                    textAnchor: 'end'
                }}
            />
            <AxisLeft
                left={45}
                top={60}
                scale={yScale}
                stroke={'#1D428A'}
                tickStroke={'#1D428A'}
                tickLabelProps={{
                    fill: '#1D428A',
                    fontSize: 12,
                    textAnchor: 'end'
                }}
            />
            <text x='-250' y='15' transform='rotate(-90)' fontSize={14}>
                {props.unitLable}
            </text>
            <AxisBottom
                top={yMax + 60}
                stroke={'#1D428A'}
                tickStroke={'#1D428A'}
                scale={xScale}
                tickLabelProps={{
                    fill: '#1D428A',
                    fontSize: 16,
                    textAnchor: 'middle'
                }}
            />
        </svg>
    );
}

interface BarData {
    data: number;
    dataLables: string;
}