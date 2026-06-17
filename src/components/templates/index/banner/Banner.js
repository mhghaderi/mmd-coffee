"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// import Image from "next/image";
import styles from "./Banner.module.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Autoplay, Navigation, Pagination } from "swiper/modules";

function Banner() {
    return (
        <>
            <div className={styles.bannerContainer}>
                <Swiper
                    navigation={true}
                    modules={[Navigation, Pagination, Autoplay]}
                    pagination={{ clickable: true }}
                    autoplay={true}
                    className="mySwiper"
                    loop={true}
                >
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
            </div>
        </>
    );
}

export default Banner;
