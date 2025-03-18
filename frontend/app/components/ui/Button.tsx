import { Link } from "@remix-run/react";
import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    icon?: ReactNode;
}

interface LinkButtonProps extends Omit<ButtonProps, 'onClick' | 'type'> {
    to: string;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    icon,
}: ButtonProps) {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-md transition-colors";

    const variantStyles = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline: "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    };

    const sizeStyles = {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-2 text-base",
    };

    const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "focus:outline-none focus:ring-2 focus:ring-offset-2";

    return (
        <button
            type={type}
            className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyle} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
}

export function LinkButton({
    children,
    variant = 'primary',
    size = 'md',
    to,
    disabled = false,
    className = '',
    icon,
}: LinkButtonProps) {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-md transition-colors";

    const variantStyles = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline: "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    };

    const sizeStyles = {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-2 text-base",
    };

    const disabledStyle = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "focus:outline-none focus:ring-2 focus:ring-offset-2";

    return (
        <Link
            to={to}
            className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyle} ${className}`}
            aria-disabled={disabled}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </Link>
    );
}