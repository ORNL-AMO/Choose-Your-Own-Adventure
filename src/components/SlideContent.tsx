import React, { Fragment, ReactNode } from "react";
import { useSwiperSlide } from 'swiper/react';


const SlideContent = (props: SlideProps) =>  {
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
};



const UnderlineSpan = (props: UnderlineProps) => {
    const swiperSlide = useSwiperSlide();
    const animationCSS = swiperSlide.isActive ? `${props.animationClass} animate-color` : '';
    const underlinedText = { __html: props.text };
    return (
        <Fragment>
            <span className={animationCSS} dangerouslySetInnerHTML={underlinedText}></span>
        </Fragment>
    )
}



export interface UnderlineProps { text: string, animationClass: string }
export interface SlideProps { statDivs: ReactNode[] }

export { UnderlineSpan };
export default SlideContent;
