"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
// import './styles.css';

import { Navigation } from "swiper/modules";

function Banner() {
    return (
        <>
            <Swiper navigation={true} modules={[Navigation]} className="mySwiper" loop={true}>
                <SwiperSlide>
                    <img src="/images/Slide-1.jpg" alt="Slide" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src="/images/Slide-2.jpg" alt="Slide" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src="/images/Slide-3.jpg" alt="Slide" />
                </SwiperSlide>
            </Swiper>
        </>
    );
}

export default Banner;
