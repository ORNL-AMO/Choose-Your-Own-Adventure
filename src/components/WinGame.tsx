import { Swiper, SwiperSlide, useSwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import './SwiperOverrides.css';
import 'animate.css';

import { PageControl } from './controls';
import React, { Fragment, ReactNode } from 'react';
import { EndGameResults } from '../trackedStats';


export default class WinGame extends React.Component<WinGameProps> {
    progressCircle;
    progressContent;

    constructor(props) {
        super(props);
        this.progressCircle = React.createRef();
        this.progressContent = React.createRef();
    }

    onAutoplayTimeLeft = (s, time, progress) => {
        this.progressCircle.current.style.setProperty('--progress', 1 - progress);
        this.progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    };


    render() {
        return (
            <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
                <Swiper
                    modules={[Pagination, Navigation, Autoplay, EffectFade]}
                    spaceBetween={30}
                    effect='fade'
                    speed={1500}
                    centeredSlides={true}
                    autoplay={{
                        delay: 10000,
                        disableOnInteraction: true,
                    }}
                    pagination={{
                        clickable: true
                    }}
                    onAutoplayTimeLeft={this.onAutoplayTimeLeft}
                    navigation={true}>
                    <SwiperSlide className='slide1-image'>
                        <SlideContent
                            statDivs={
                                [<div
                                    key={'slide1'}
                                    className='slide-stat-div'
                                    style={{ fontSize: '48px', textTransform: 'uppercase' }}>
                                    <span>Congratulations!</span>
                                </div>,
                                <div
                                    key={'slide1b'}
                                    className='slide-stat-div child-stat-div'>
                                    <span>Your company has met the decarbonization goal, reducing CO<sub>2</sub>e emissions by</span>
                                    <UnderlineSpan text={`${this.props.endGameResults.carbonSavingsPercent}% `}
                                        animationClass='animate-underline-emphasis'></UnderlineSpan>

                                </div>
                                ]
                            }
                        />
                    </SwiperSlide>
                    <SwiperSlide className='slide2-image'>
                        <SlideContent
                            statDivs={
                                [
                                    <div
                                        key={'slide2'}
                                        className='slide-stat-div'>
                                        <span>In the game, you spent
                                            <UnderlineSpan text={`$${this.props.endGameResults.gameTotalSpending}`}
                                                animationClass='animate-underline-emphasis'></UnderlineSpan>
                                            on GHG reduction measures.
                                        </span>

                                    </div>,
                                    <div
                                        key={'slide2b'}
                                        className='slide-stat-div child-stat-div'>
                                        {this.props.endGameResults.projectedFinancedSpending ?
                                            <span>In the years after the game, you will spend <UnderlineSpan text={`$${this.props.endGameResults.projectedFinancedSpending}`}
                                                animationClass='animate-underline-emphasis'></UnderlineSpan> on financed and power purchase agreement projects.
                                            </span>
                                            :
                                            <></>
                                        }
                                    </div>
                                ]
                            }
                        />
                    </SwiperSlide>
                    <SwiperSlide className='slide3-image'>
                        <SlideContent
                            statDivs={
                                [
                                    <div
                                        key={'slide3'}
                                        className='slide-stat-div'>
                                        <span>
                                            Your total spend on GHG reduction projects will be
                                            <UnderlineSpan text={`$${this.props.endGameResults.gameCurrentAndProjectedSpending}`}
                                                animationClass='animate-underline-emphasis'></UnderlineSpan>
                                            and you will have reduced your GHG emissions by
                                            <UnderlineSpan text={`${this.props.endGameResults.carbonSavingsKg} kg/yr`} animationClass='animate-underline-emphasis'></UnderlineSpan>
                                        </span>
                                    </div>,
                                    <div
                                        key={'slide3b'}
                                        className='slide-stat-div child-stat-div'>
                                        <span>
                                            Your cost of carbon reduction is
                                            <UnderlineSpan text={`$${this.props.endGameResults.costPerCarbonSavings}/kg CO<sub>2</sub>e`} animationClass='animate-underline-emphasis'></UnderlineSpan>
                                        </span>
                                    </div>
                                ]
                            }
                        />
                    </SwiperSlide>
                    <SwiperSlide className='slide4-image'>
                        <SlideContent
                            statDivs={
                                [
                                    <div
                                        key={'slide4c'}
                                        className='slide-stat-div'>
                                        Overall, You reduced your GHG emissions by {this.props.endGameResults.carbonSavingsPercent}%
                                    </div>,
                                    <div
                                        key={'slide4b'}
                                        className='slide-stat-div child-stat-div'>
                                        This cost ${this.props.endGameResults.costPerCarbonSavings}/kg CO<sub>2</sub>e
                                    </div>,
                                    <div
                                        key={'slide4'}
                                        className='slide-stat-div child-stat-div'
                                        style={{ fontSize: '64px', marginTop: '3rem' }}>
                                        <span>Thank you!</span>
                                    </div>,
                                ]
                            }
                        />
                    </SwiperSlide>

                    <div className='autoplay-progress' slot='container-end'>
                        <svg viewBox='0 0 48 48' ref={this.progressCircle}>
                            <circle cx='24' cy='24' r='20'></circle>
                        </svg>
                        <span ref={this.progressContent}></span>
                    </div>
                </Swiper>
            </div>
        );
    }

}

export interface WinGameProps {
    endGameResults: EndGameResults;
}

export function newWinGameControl(): PageControl {
    return {
        componentClass: WinGame,
        controlProps: {},
        hideDashboard: true,
    };
}

export interface UnderlineProps { text: string, animationClass: string }

function UnderlineSpan(props: UnderlineProps) {
    const swiperSlide = useSwiperSlide();
    const animationCSS = swiperSlide.isActive ? `${props.animationClass} animate-color` : '';
    const underlinedText = { __html: props.text };
    return (
        <Fragment>
            <span className={animationCSS} dangerouslySetInnerHTML={underlinedText}></span>
        </Fragment>
    )
}


export interface SlideProps { statDivs: ReactNode[] }

function SlideContent(props: SlideProps) {
    const swiperSlide = useSwiperSlide();
    const animationCSS = swiperSlide.isActive ? `animate__animated animate__fadeIn animate__slow` : '';

    return (
        <div className="slide-overlay">
            <div className='slide-flex-space'></div>
            <div className={`slide-overlay-rect ${animationCSS}`}>
                {props.statDivs.map(div => {
                    return (div)
                })}
            </div>
            <div className='slide-flex-space'></div>
        </div>
    )
}
