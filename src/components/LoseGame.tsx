import React from 'react';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import './SwiperOverrides.css';
import 'animate.css';
import { PageControl } from './controls';
import NorthIcon from '@mui/icons-material/North';
import { EndGameResults } from '../trackedStats';
import { Box } from '@mui/material';


export default class LoseGame extends React.Component<LoseGameProps> {

    render() {
        const statOneDelay = 6000;
        const statTwoDelay = 7000;
        const statThreeDelay = 8000;
        const initialDelay = 4500;

        return (
            <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
                <Swiper
                    centeredSlides={true}
                >
                    <SwiperSlide id='fade-to-white' className='lose-game-bg' style={{position: 'relative'}}>
                        <div style={{
                            marginTop: '100px',
                            color: '#444',
                            display: 'flex',
                            position: 'absolute',
                            width: '100%'
                        }}>
                            <div  style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            maxWidth: '75%',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}>

                            <Box
                                className='lose-game-text animate__animated animate__fadeIn animate__slower'
                                sx={{ 
                                    animationDelay: {xs: `${String(statOneDelay - initialDelay)}ms`, md: `${statOneDelay}ms`}
                                    }}>
                                <span>Your company has reduced CO2e emissions by {`${this.props.endGameResults.carbonSavingsPercent}%`} in 10 years</span>
                            </Box>

                            <Box
                                className='lose-game-text animate__animated animate__fadeIn animate__slower'
                                sx={{ 
                                    animationDelay: {xs: `${String(statTwoDelay - initialDelay)}ms`, md: `${statTwoDelay}ms`}
                                    }}>
                                <span>You were unable to meet your goal of decarbonizing by 50%</span>
                            </Box>

                            <Box
                                className='lose-game-text animate__animated animate__fadeIn animate__slower'
                                sx={{ 
                                    animationDelay: {xs: `${String(statThreeDelay - initialDelay)}ms`, md: `${statThreeDelay}ms`}
                                    }}>
                                <span>Try again?</span>
                            </Box>
                            <div
                                style={{
                                    display: 'flex',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    width: '100px'
                                }}
                            ></div>
                            </div>
                        </div>

                        <Box sx={{
                            color: '#444',
                            display: {xs: 'none', md: 'flex'},
                            flexDirection: 'column',
                            justifyContent: 'end',
                            height: '100%'
                        }}>
                            <div style={{flexGrow: '1'}}></div>
                            <div className="lose-captioned">
                                <div style={{ marginLeft: '96px' }}>

                                <div className="animate__animated animate__fadeInRight" style={{ animationDelay: '1000ms' }}>
                                    <span style={{ fontSize: '32px', fontWeight: '800' }}>
                                       This is you &nbsp; <NorthIcon style={{ fontSize: '32px'}} /> 
                                    </span>
                                </div>
                                <div className="animate__animated animate__fadeInRight" style={{ animationDelay: '3500ms' }}>
                                    You should have visited the&nbsp; 
                                    <br />
                                    <a style={{ color: '#fff'}} href="https://betterbuildingssolutioncenter.energy.gov">
                                        Better Building Solution Center</a>.
                                </div>
                                </div>
                            </div>
                            <div style={{flexGrow: '.1'}}></div>
                        </Box>
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
