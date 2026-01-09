import React from "react";
import { NavLink, useNavigate } from "react-router-dom";


export default function Nav() {
    const navigate = useNavigate();
    return (
        <header className="bg-black shadow-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                <h1 className="text-lg font-bold cursor-pointer text-white" onClick={() => navigate("/")}>MyWebsite</h1>
                <nav className="space-x-4">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'underline font-semibold text-white' : 'text-gray-300 hover:underline hover:text-white'} end>Home</NavLink>
                    <NavLink to="/about_us" className={({ isActive }) => isActive ? 'underline font-semibold text-white' : 'text-gray-300 hover:underline hover:text-white'} end>
                    About Us
                    </NavLink>
                    
                </nav>
                </div>
        </header>
        
    
    );
}