import {useState} from "react";
import {Link} from "react-router-dom";
import {ContributeModal} from "../ContributeModal/ContributeModal";
import './NavBar.css';

export function NavBar() {

    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isContributeOpen, setIsContributeOpen] = useState(false);
    return (
        <>
        <nav className="navBar">
            <section className="navBarContainer">
                <section className="navBarContent">
                    <section className="navBarLeft">
                        <Link to="/" className="navBarLogo">
                        <section className="navBarLogoText" aria-hidden="true">
                        <h1>Roots Behind Routes</h1>
                        <p>Johannesburg, South Africa</p>
                        </section>
                        </Link>

                        <ul className="navBarLinks">
                            <li className="navBarLinkItem">
                                <Link to="/" className="navBarLink">Discover</Link>
                            </li>
                            <li className="navBarLinkItem">
                                <Link to="/Map" className="navBarLink">Map</Link>
                            </li>
                            <li className="navBarLinkItem">
                                <Link to="/About" className="navBarLink">About</Link>
                            </li>
                            <li className="navBarLinkItem">
                                <Link to="/Saved" className="navBarLink">Saved</Link>
                            </li>
                        </ul>
                    </section>

                    <section className="navBarRight">
                        {isSearchExpanded ? (
                            <form className="navBarSearch navBarSearchExpanded" onSubmit={(e) => e.preventDefault}>
                                <input
                                    type="text"
                                    placeholder="Search places..."
                                    className="navBarSearchInput"
                                    aria-label="Search places"
                                    autoFocus
                                    onBlur={()=> setIsSearchExpanded(false)}
                                /> 
                                <Search className="navBarSearchIcon" aria-hidden="true"/>                               
                                </form>
                        ) : (
                            <button
                            onClick={() => setIsSearchExpanded(true)}
                            className="navBarIconButton"
                            type="button"
                            aria-label="Search places"
                            >
                            🔍︎
                            </button>                         
                        )}

                            <button
                            onClick={() => setIsContributeOpen(true)}
                            className="contributeButton"
                            type="button"
                            aria-label="Contribute"
                            >
                            Contribute
                            </button>                         
                        
                            <button
                            className="navBarIconButton"
                            type="button"
                            aria-label="User profile"
                            >
                            User Profile
                            </button>
                    </section>
                </section>
            </section>
        </nav>

        <ContributeModal 
        isOpen={isContributeOpen}
        onClose={()=> setIsContributeOpen(false)}/>
    </>

    );
}

export default NavBar;

