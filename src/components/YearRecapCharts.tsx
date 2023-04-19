import React, { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientTealBlue } from '@visx/gradient';
import letterFrequency from '@visx/mock-data/lib/mocks/letterFrequency';
import type { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';
import { scaleBand, scaleLinear } from '@visx/scale';
import type { TrackedStats } from '../trackedStats';
import { AxisBottom } from '@visx/axis';

const data = letterFrequency.slice(5);
const verticalMargin = 120;

// accessors
const getLable = (d: BarData) => d.dataLables;
const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;

export type BarsProps = {
    yearRangeInitialStats: TrackedStats[];
    width: number;
    height: number;
    events?: boolean;
};

export default function Example({ yearRangeInitialStats, width, height, events = false }: BarsProps) {
    let carbonBarData: BarData[] = [];
    let yearCount: number = 1;
    yearRangeInitialStats.forEach(year => {
        carbonBarData.push({
            carbonData: year.carbonSavingsPercent * 100,
            dataLables: 'Year ' + yearCount
        });
        console.log('Bar data ' + year.carbonSavingsPercent * 100)
        yearCount++;
    });


    // bounds
    const xMax = width;
    const yMax = height - verticalMargin;

    // scales, memoize for performance
    const xScale = useMemo(
        () =>
            scaleBand<string>({
                range: [0, xMax],
                round: true,
                domain: carbonBarData.map(getLable),
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

    return width < 10 ? null : (
        <svg width={width} height={height}>
            <rect width={width} height={height} fill='#b9f8f3' rx={14} />
            <Group top={verticalMargin / 2}>
                {carbonBarData.map((d) => {
                    const letter = d.dataLables;
                    const barWidth = xScale.bandwidth();
                    const barHeight = yMax - (yScale(d.carbonData) ?? 0);
                    const barX = xScale(letter);
                    const barY = yMax - barHeight;
                    return (
                        <Bar
                            key={`bar-${letter}`}
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={barHeight}
                            fill='#0b756c'
                            onClick={() => {
                                if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`);
                            }}
                        />
                    );
                })}
            </Group>
            <AxisBottom
                top={yMax + 90}
                stroke={'#0b756c'}
                tickStroke={'#0b756c'}
                hideAxisLine
                scale={xScale}
                labelProps={{
                    fill: '#0b756c',
                    fontSize: 11,
                    textAnchor: 'middle',
                }}
            />
        </svg>
    );
}

interface BarData {
    carbonData: number;
    dataLables: string;
}