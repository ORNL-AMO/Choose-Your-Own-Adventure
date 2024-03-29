import React from 'react';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import './SwiperOverrides.css';
import 'animate.css';
import { PageControl } from './controls';
import { EndGameResults } from '../trackedStats';


export default class LoseGame extends React.Component<LoseGameProps> {

    render() {
        return (
            <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
                <Swiper
                    centeredSlides={true}
                >
                    <SwiperSlide id='fade-to-white' className='lose-game-bg'>
                        <div style={{
                            marginTop: '100px',
                            color: '#444',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            maxWidth: '75%',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}>
                            {/* <div
                                style={{
                                    display: 'flex',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    width: '100px'
                                }}
                            ></div> */}
                            <div
                                className='lose-game-text animate__animated animate__fadeIn animate__slower'
                                style={{ animationDelay: '500ms' }}>
                                <span>Your company has reduced CO2e emissions by {`${this.props.endGameResults.carbonSavingsPercent}%`} in 10 years</span>
                            </div>

                            <div
                                className='lose-game-text animate__animated animate__fadeIn animate__slower'
                                style={{ animationDelay: '3500ms' }}>
                                <span>You were unable to meet your goal of decarbonizing by 50%</span>
                            </div>

                            <div
                                className='lose-game-text animate__animated animate__fadeIn animate__slower'
                                style={{ animationDelay: '7000ms' }}>
                                <span>Try again?</span>
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
                    </SwiperSlide>
                </Swiper>
            </div>
        );
    }

}

export interface LoseGameProps {
    endGameResults: EndGameResults;
}

export function newLoseGameControl(): PageControl {
    return {
        componentClass: LoseGame,
        controlProps: {},
        hideDashboard: true,
    };
}
