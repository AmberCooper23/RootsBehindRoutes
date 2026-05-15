import React from "react";
import './Hero.css';
import HeroImage from '../../assets/RedTaxiImage.jpg';

export function Hero() {
    return (
        <section className='hero'>
            <section className="heroGrid">
                <section className="heroContainer">
                <article className='heroBadge'>
                    {/* <p className='badgeText'>
                        Est. 2026
                    </p> */}
                    Est. 2026
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

                <dl className="heroStats">
                    <article>
                        <dt className='heroStatValue'>100+</dt>
                        <dd className='heroStatLabel'>Authentic Places</dd>
                    </article>
                    <article>
                        <dt className='heroStatValue'>50+</dt>
                        <dd className='heroStatLabel'>Local Voices</dd>
                    </article>
                    <article>
                        <dt className='heroStatValue'>10K+</dt>
                        <dd className='heroStatLabel'>Happy Travelers</dd>
                    </article>
                </dl>

                </section>
                <figure className='heroImageContainer'>
                    <article className="heroImageBorder"></article>
                    <img className='heroImage' src={HeroImage} alt="Johannesburg Street Scene" />
                        <blockquote className='QuoteContainer'>
                            <section className='QuoteContent'>
                                <p className='QuoteText'>
                                Culture is an experience, not a commodity.
                                </p>
                                <cite className='QuoteAuthor'>
                                Amber Cooper
                                </cite>
                            </section>
                        </blockquote> 
                </figure>
            </section>  
            </section>
    );
}

export default Hero;