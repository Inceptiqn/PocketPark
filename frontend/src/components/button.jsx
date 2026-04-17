import './button.css';

function Button({
	label,
	imageSrc,
	imageAlt = 'Button icon',
	ariaLabel,
	type = 'button',
	className = '',
	onClick,
	disabled = false,
}) {
	if (!label && !imageSrc) {
		console.warn('Button requires at least one of: label or imageSrc.');
		return null;
	}

	const isIconOnly = Boolean(imageSrc && !label);
	const contentClass = ['pp-button', isIconOnly ? 'icon-only' : '', className]
		.filter(Boolean)
		.join(' ');
	const accessibleLabel = ariaLabel || label || imageAlt;

	return (
		<button
			type={type}
			className={contentClass}
			onClick={onClick}
			disabled={disabled}
			aria-label={accessibleLabel}
			title={accessibleLabel}
		>
			{imageSrc ? <img className="pp-button__icon" src={imageSrc} alt={imageAlt} /> : null}
			{label ? <span className="pp-button__label">{label}</span> : null}
		</button>
	);
}

export default Button;
