import { Swiper, SwiperSlide, useSwiper, useSwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay, EffectFade } from 'swiper/modules';
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
            <div style={{width: '100%', height: '100vh', position: 'relative'}}>
                 <Swiper
                 modules={[Pagination, Navigation, Autoplay, EffectFade]} 
                 spaceBetween={30}
                 effect='fade'
                 speed={1000}
                 centeredSlides={true}
                 autoplay={{
                    delay: 9000,
                    disableOnInteraction: true,
                 }}
                 pagination={{
                    clickable: true 
                  }}
                onAutoplayTimeLeft={this.onAutoplayTimeLeft}
                navigation={true}
                 className='mySwiper'
                 >
                    <SwiperSlide className='slide1-image'>
                        <SlideContent
                            statDivs={
                                [<div
                                    key={'slide1'}
                                    className='slide-stat-div'
                                    style={{marginTop: 0}}>
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
                                [<div
                                    key={'slide2'}
                                    className='slide-stat-div'>
                                    <span>While spending 
                                    <UnderlineSpan text={`$${this.props.endGameResults.gameTotalSpending}`} 
                                    animationClass='animate-underline-emphasis'></UnderlineSpan> 
                                    on GHG reduction measures, your cost per kg reduced was 
                                    <UnderlineSpan text={`$${this.props.endGameResults.costPerCarbonSavings}/kg CO<sub>2</sub>e`} 
                                    animationClass='animate-underline-emphasis'></UnderlineSpan> 
                                    </span>
                                    
                                </div>
                                ]
                            }
                        />
                    </SwiperSlide>
                    <SwiperSlide className='slide3-image'>
                        <SlideContent
                            statDivs={
                                [<div
                                    key={'slide3'}
                                    className='slide-stat-div'>
                                    {this.props.endGameResults.projectedFinancedSpending?  
                                    <span>You are projected to spend
                                        <UnderlineSpan text={`$${this.props.endGameResults.projectedFinancedSpending}`} 
                                        animationClass='animate-underline-emphasis'></UnderlineSpan>
                                        on financed and renewed projects.
                                    </span>
                                    :
                                    <></>
                                    }
                                </div>,
                                    <div
                                        key={'slide3b'}
                                        className='slide-stat-div'
                                        style={{marginTop: '3rem'}}>
                                        <span>Your total spend including projections is
                                            <UnderlineSpan text={`$${this.props.endGameResults.gameCurrentAndProjectedSpending}`} 
                                            animationClass='animate-underline-emphasis'></UnderlineSpan>
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
                                        className='slide-stat-div'
                                        style={{
                                            fontSize: '24px', textTransform: 'uppercase',
                                            maxWidth: '75%',
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            lineHeight: '3rem'
                                        }}>
                                        You reduced CO<sub>2</sub><small>e</small> emissions by {this.props.endGameResults.carbonSavingsPercent} 
                                    </div>,
                                    <div
                                        key={'slide4b'}
                                        className='slide-stat-div'
                                        style={{
                                            fontSize: '24px', textTransform: 'uppercase',
                                            maxWidth: '75%',
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            lineHeight: '3rem'
                                        }}>
                                        Cost per kg was reduced to {this.props.endGameResults.costPerCarbonSavings}/kg CO<sub>2</sub>e
                                    </div>,
                                    <div
                                        key={'slide4'}
                                        className='slide-stat-div'
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

export interface UnderlineProps {text: string, animationClass: string}

function UnderlineSpan(props: UnderlineProps) {
    const swiperSlide = useSwiperSlide();
    const animationCSS = swiperSlide.isActive? `${props.animationClass} animate-color` : '';
    const underlinedText = {__html: props.text};
 return (
     <Fragment>
         <span>&nbsp;</span>
         <span className={animationCSS} dangerouslySetInnerHTML={underlinedText}></span>
         <span>&nbsp;</span>
     </Fragment>
 )
}


export interface SlideProps {statDivs: ReactNode[]}

function SlideContent(props: SlideProps) {
    const swiperSlide = useSwiperSlide();
    const animationCSS = swiperSlide.isActive? `animate__animated animate__fadeIn animate__fast` : '';

    return (
        <div style={{
            marginTop: '200px',
            color: '#444',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
        }}>
            <div
                style={{
                    display: 'flex',
                    color: '#fff',
                    borderRadius: '10px',
                    width: '100px'
                }}
            ></div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    backgroundColor: 'rgba(68,68,68,.8)',
                    color: '#fff',
                    maxWidth: '50%',
                    borderRadius: '10px',
                    padding: '64px',
                    animationFillMode: 'forwards',
                    animationDelay: '500ms',
                    opacity: 0,
                }}
                className={animationCSS}
            >
                {props.statDivs.map(div => {
                    return (div)
                })}
            </div>


            <div
                style={{
                    display: 'flex',
                    color: '#fff',
                    borderRadius: '10px',
                    width: '100px'
                }}
            ></div>
        </div>
        )
}
