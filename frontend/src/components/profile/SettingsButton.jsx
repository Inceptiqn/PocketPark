export default function SettingsButton({ onClick }) {
	return (
		<button
			className="pp-settings-btn"
			onClick={onClick}
			aria-label="Impostazioni"
		>
			<img
				className="pp-settings-btn__icon"
				src="https://www.svgrepo.com/show/522658/settings.svg"
				alt=""
				aria-hidden="true"
			/>
		</button>
	);
}
