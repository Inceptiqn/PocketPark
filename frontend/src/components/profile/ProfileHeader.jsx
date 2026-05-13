export default function ProfileHeader({ user, onEditClick, onSettingsClick }) {
	const initials = `${user.nome[0]}${user.cognome[0]}`.toUpperCase();
	const fullName = `${user.nome} ${user.cognome}`;

	return (
		<div className="pp-profile-header">
			<div className="pp-profile-header__avatar">
				{initials}
			</div>
			<div className="pp-profile-header__info">
				<div className="pp-profile-header__name-row">
					<h1 className="pp-profile-header__name">{fullName}</h1>
					<button
						className="pp-profile-header__edit-btn"
						onClick={onEditClick}
						type="button"
					>
						modifica
					</button>
				</div>
				<p className="pp-profile-header__email">{user.email}</p>
			</div>
			<div className="pp-profile-header__settings-slot">
				<button
					className="pp-settings-btn"
					onClick={onSettingsClick}
					aria-label="Impostazioni"
				>
					<img
						className="pp-settings-btn__icon"
						src="https://www.svgrepo.com/show/522658/settings.svg"
						alt=""
						aria-hidden="true"
					/>
				</button>
			</div>
		</div>
	);
}
