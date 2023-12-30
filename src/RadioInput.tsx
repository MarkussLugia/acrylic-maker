import { useState } from "react";
import "./RadioInput.css"

interface RadioInputProps<T> {
    options: { name: string, value: T }[],
    onChange: (value: T) => void,
    defaultValue?: T,
    disabled?: boolean
}

export function RadioInput<T>({ options, onChange, defaultValue, disabled }: RadioInputProps<T>) {
    const [value, setValue] = useState(defaultValue || options[0].value)

    function handleClick(value: T) {
        if (disabled) return
        setValue(value);
        onChange(value);
    };

    return (
        <div className={`radio-input-wrapper ${disabled && "disabled"}`}>
            {options.map((option, index) => (
                <div key={index} className="radio-input-option" onClick={() => handleClick(option.value)}>
                    <div className={`radio-input-option-button ${value === option.value && "active"}`}><div></div></div>
                    <div className="radio-input-option-text">{option.name}</div>
                </div>
            ))}
        </div>
    );
};