import React from "react";
import { NavLink, useNavigate } from "react-router-dom";


export default function Nav() {
    const navigate = useNavigate();
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                <h1 className="text-lg font-bold cursor-pointer" onClick={() => navigate("/")}>MyWebsite</h1>
                <nav className="space-x-4">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'underline font-semibold' : 'text-gray-600 hover:underline'} end>Home</NavLink>
                    <NavLink to="/about_us" className={({ isActive }) => isActive ? 'underline font-semibold' : 'text-gray-600 hover:underline'} end>
                    About Us
                    </NavLink>
                    
                </nav>
                </div>
        </header>
        
    
    );}