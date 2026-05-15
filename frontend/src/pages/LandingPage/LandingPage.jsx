import React from 'react';
import Hero from '../../components/Hero/Hero';
import Filter from '../../components/Filter/Filter';

export function LandingPage() {

    return (
        <main className='landingPage'>
            <Hero />
            <Filter />

        </main>
    );
}

export default LandingPage;