import React from "react";

export function Hero() {
    return (
        <section className='heroContainer'>
                <article className='heroBadge'>
                    <p className='badgeText'>
                        Est. 2026
                    </p>
                </article>
                
                <h1 className='heroTitle'>
                    Journey Beyond the Tourist Trails
                </h1>
                <p className='heroSubtitle'>
                    Discover Johannesburg's cultural tapestry through the eyes of her people.
                </p>
                <section className='ctaButtonContainer'>
                    <button className='ctaButtonSolid'>Start Exploring</button>
                    <button className='ctaButtonOutline'>Our Story</button>
                </section>

                <figure className='heroImageContainer'>
                    <img className='heroimage'>
                    </img>
                        <blockquote className='heroQuoteContainer'>
                            <section className='heroQuoteContent'>
                                <p className='heroQuoteText'>
                                Culture is an experience, not a commodity.
                                </p>
                                <cite className='heroQuoteAuthor'>
                                Amber Cooper
                                </cite>
                            </section>
                        </blockquote> 
                </figure>
                
            </section>
    );
}

export default Hero;