
import React from 'react';

interface CalculatorButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ onClick, children, className = '' }) => {
    const baseClasses = "text-xl font-bold rounded-full h-20 w-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#2e7cd1] focus:ring-opacity-75 transition duration-200 active:scale-95";
    
    return (
        <button onClick={onClick} className={`${baseClasses} ${className}`}>
            {children}
        </button>
    );
};

export default CalculatorButton;
