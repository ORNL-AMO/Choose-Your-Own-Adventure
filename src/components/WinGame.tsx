// Import Swiper React components
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay, EffectFade } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import './SwiperOverrides.css';
import 'animate.css';

import { PageControl } from './controls';
import React, { Fragment, ReactNode } from 'react';
import { EndGameProps } from './Dialogs/EndGameDialog';


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
                {/*  // todo deal with prefers reduced motion */}
                 <Swiper
                 modules={[Pagination, Navigation, Autoplay, EffectFade]} 
                 spaceBetween={30}
                 effect='fade'
                 speed={500}
                //  onSlideChange={() => }
                 centeredSlides={true}
                 autoplay={{
                    delay: 9000,
                    disableOnInteraction: true,
                 }}
                 pagination={{
                    clickable: true 
                  }}
                // onAutoplay={(swiper) => {
                // }}
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
                                    <span>Your company has met the decarbonization goal, reducing CO2e emissions by</span>
                                    <UnderlineSpan text={'60%'} animationClass='animate-underline-emphasis'></UnderlineSpan> 

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
                                    <UnderlineSpan text={'$3,930,000'} animationClass='animate-underline-emphasis'></UnderlineSpan> 
                                    on GHG reduction measures, your cost per kg reduced was 
                                    <UnderlineSpan text={'$0.88/kg CO2e'} animationClass='animate-underline-emphasis'></UnderlineSpan> 
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
                                    <span>You are projected to spend
                                        <UnderlineSpan text={'$4,140,000'} animationClass='animate-underline-emphasis'></UnderlineSpan>
                                        on financed and renewed projects.
                                    </span>

                                </div>,
                                    <div
                                        key={'slide3b'}
                                        className='slide-stat-div'
                                        style={{marginTop: '3rem'}}>
                                        <span>Your total projected spend is
                                            <UnderlineSpan text={'$4,600,000'} animationClass='animate-underline-emphasis'></UnderlineSpan>
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
                                        key={'slide4b'}
                                        className='slide-stat-div'
                                        style={{ fontSize: '24px', textTransform: 'none',
                                        maxWidth: '75%',
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                        lineHeight: '3rem'
                                        }}>
                                        Your company reduced CO<sub>2</sub>e Emissions by
                                        <UnderlineSpan text={`${51}%`} animationClass='animate-underline-emphasis'></UnderlineSpan>
                                        with cost per kg reduced to <UnderlineSpan text={`$${.88}/kg CO2e`} animationClass='animate-underline-emphasis'></UnderlineSpan>
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

export interface WinGameProps extends EndGameProps {}

export function newWinGameControl(): PageControl {
	return {
		componentClass: WinGame,
		controlProps: {},
		hideDashboard: true,
	};
}

export interface UnderlineProps {text: string, animationClass: string}

function UnderlineSpan(props: UnderlineProps) {
    // todo animationClass was ID animate-underline-emphasis
 return (
     <Fragment>
         <span>&nbsp;&nbsp;</span>
         <span
             onAnimationStart={e => console.log('onAnimationStart', e)}
             onAnimationIteration={e => console.log('onAnimationIteration', e)}
             onAnimationEnd={e => console.log('onAnimationEnd', e)}
             className={`${props.animationClass} animate-color`}>{props.text}</span>
         <span>&nbsp;&nbsp;</span>
     </Fragment>
 )
}


export interface SlideProps {statDivs: ReactNode[]}

function SlideContent(props: SlideProps) {
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
                className='animate__animated animate__fadeInLeft animate__fast'
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
