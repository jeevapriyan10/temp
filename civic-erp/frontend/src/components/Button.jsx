export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  };

  return (
    <button
      className={`${baseClasses[variant] || baseClasses.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
