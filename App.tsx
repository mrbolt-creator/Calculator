import React, { useState, useEffect, useCallback, useRef } from 'react';
import CalculatorButton from './components/CalculatorButton';

const App: React.FC = () => {
    const [currentOperand, setCurrentOperand] = useState<string>('0');
    const [previousOperand, setPreviousOperand] = useState<string | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [overwrite, setOverwrite] = useState<boolean>(true);
    const displayRef = useRef<HTMLDivElement>(null);

    const formatOperand = (operand: string | null): string => {
        if (operand == null) return '';
        if (operand === 'Error') return 'Error';
        const [integer, decimal] = operand.split('.');
        const formattedInteger = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0,
        }).format(Number(integer));
        if (decimal != null) {
            return `${formattedInteger}.${decimal}`;
        }
        return formattedInteger;
    };

    const displayValue = formatOperand(currentOperand);
    
    useEffect(() => {
        if (displayRef.current) {
            displayRef.current.classList.remove('flicker-effect');
            // A timeout is used to allow the DOM to update before re-adding the class
            setTimeout(() => displayRef.current?.classList.add('flicker-effect'), 0);
        }
    }, [displayValue]);


    const clear = useCallback(() => {
        setCurrentOperand('0');
        setPreviousOperand(null);
        setOperation(null);
        setOverwrite(true);
    }, []);

    const deleteDigit = useCallback(() => {
        if (overwrite) {
            clear();
            return;
        }
        if (currentOperand.length === 1) {
            setCurrentOperand('0');
            setOverwrite(true);
            return;
        }
        setCurrentOperand(currentOperand.slice(0, -1));
    }, [currentOperand, overwrite, clear]);

    const addDigit = useCallback((digit: string) => {
        if (currentOperand === 'Error') return;
        if (digit === '.' && currentOperand.includes('.')) return;
        
        if (overwrite) {
            setCurrentOperand(digit);
            setOverwrite(false);
        } else {
            if (currentOperand === '0' && digit !== '.') {
                 setCurrentOperand(digit);
            } else {
                 setCurrentOperand(prev => `${prev}${digit}`);
            }
        }
    }, [currentOperand, overwrite]);

    const calculate = useCallback(() => {
        if (operation == null || previousOperand == null || currentOperand === 'Error') return;

        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        let computation: number;
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    setCurrentOperand('Error');
                    setPreviousOperand(null);
                    setOperation(null);
                    setOverwrite(true);
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        const result = computation.toString();
        setCurrentOperand(result);
        setOperation(null);
        setPreviousOperand(null);
        setOverwrite(true);
    }, [operation, previousOperand, currentOperand]);

    const selectOperation = useCallback((selectedOperation: string) => {
        if (currentOperand === 'Error') {
            clear();
            return;
        }
        if (currentOperand === '0' && previousOperand === null) return;
        if (previousOperand !== null && !overwrite) {
            calculate();
        }

        setOperation(selectedOperation);
        // Use a function with the result of calculate if it ran
        setPreviousOperand(prev => currentOperand);
        setOverwrite(true);
        
    }, [currentOperand, previousOperand, overwrite, calculate, clear]);
    
    // This effect ensures that after a calculation, the new previousOperand is set correctly
    // for chaining operations like "2+2+2"
    useEffect(() => {
        if(operation && overwrite && previousOperand !== currentOperand) {
            setPreviousOperand(currentOperand);
        }
    }, [currentOperand, operation, overwrite, previousOperand])


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { key } = event;
            if (/[0-9.]/.test(key)) {
                event.preventDefault();
                addDigit(key);
            } else if (/[+\-*/]/.test(key)) {
                event.preventDefault();
                selectOperation(key === '*' ? '×' : key === '/' ? '÷' : key);
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculate();
            } else if (key === 'Backspace') {
                event.preventDefault();
                deleteDigit();
            } else if (key === 'Escape' || key.toLowerCase() === 'c') {
                event.preventDefault();
                clear();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [addDigit, selectOperation, calculate, deleteDigit, clear]);

    const functionButtonClasses = "bg-[#2e7cd1] hover:bg-blue-500 text-white shadow-lg shadow-[#2e7cd1]/30";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/20 to-black font-mono">
            <div className="w-full max-w-sm mx-auto rounded-2xl bg-black/30 backdrop-blur-lg shadow-2xl shadow-[#2e7cd1]/20 border border-white/20 p-4">
                <div className="bg-gray-800/80 text-white p-4 rounded-lg mb-4 break-all h-28 flex flex-col items-end justify-between">
                    <div className="text-gray-400 text-2xl h-8 truncate">
                        {previousOperand && operation ? `${formatOperand(previousOperand)} ${operation}` : ''}
                    </div>
                    <div ref={displayRef} className="text-5xl truncate flicker-effect">
                        {displayValue}
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    <CalculatorButton onClick={clear} className="col-span-2 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 focus:ring-red-500">AC</CalculatorButton>
                    <CalculatorButton onClick={deleteDigit} className={`${functionButtonClasses}`}>DEL</CalculatorButton>
                    <CalculatorButton onClick={() => selectOperation('÷')} className={`${functionButtonClasses} text-2xl`}>÷</CalculatorButton>
                    
                    <CalculatorButton onClick={() => addDigit('7')} className="bg-gray-700 hover:bg-gray-600 text-white">7</CalculatorButton>
                    <CalculatorButton onClick={() => addDigit('8')} className="bg-gray-700 hover:bg-gray-600 text-white">8</CalculatorButton>
                    <CalculatorButton onClick={() => addDigit('9')} className="bg-gray-700 hover:bg-gray-600 text-white">9</CalculatorButton>
                    <CalculatorButton onClick={() => selectOperation('×')} className={`${functionButtonClasses} text-2xl`}>×</CalculatorButton>

                    <CalculatorButton onClick={() => addDigit('4')} className="bg-gray-700 hover:bg-gray-600 text-white">4</CalculatorButton>
                    <CalculatorButton onClick={() => addDigit('5')} className="bg-gray-700 hover:bg-gray-600 text-white">5</CalculatorButton>
                    <CalculatorButton onClick={() => addDigit('6')} className="bg-gray-700 hover:bg-gray-600 text-white">6</CalculatorButton>
                    <CalculatorButton onClick={() => selectOperation('-')} className={`${functionButtonClasses} text-2xl`}>-</CalculatorButton>

                    <CalculatorButton onClick={() => addDigit('1')} className="bg-gray-700 hover:bg-gray-600 text-white">1</CalculatorButton>
                    <CalculatorButton onClick={() => addDigit('2')} className="bg-gray-700 hover:bg-gray-600 text-white">2</CalculatorButton>
                    <CalculatorButton onClick={() => addDigit('3')} className="bg-gray-700 hover:bg-gray-600 text-white">3</CalculatorButton>
                    <CalculatorButton onClick={() => selectOperation('+')} className={`${functionButtonClasses} text-2xl`}>+</CalculatorButton>

                    <CalculatorButton onClick={() => addDigit('0')} className="col-span-2 bg-gray-700 hover:bg-gray-600 text-white">0</CalculatorButton>
                    <CalculatorButton onClick={() => addDigit('.')} className="bg-gray-700 hover:bg-gray-600 text-white">.</CalculatorButton>
                    <CalculatorButton onClick={calculate} className={`${functionButtonClasses} text-2xl`}>=</CalculatorButton>
                </div>
            </div>
        </div>
    );
};

export default App;