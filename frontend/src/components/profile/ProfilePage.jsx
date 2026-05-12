import { useEffect, useState } from 'react';
import ProfileHeader from './ProfileHeader';
import VehicleCard from './VehicleCard';
import SettingsModal from './SettingsModal';
import EditProfileModal from './EditProfileModal';
import { getCurrentUserId, getUserById, getVeicoliByUtenteId } from '../../API';
import './ProfilePage.css';

export default function ProfilePage() {
	const [user, setUser] = useState(null);
	const [veicoli, setVeicoli] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const loadProfile = async () => {
			const userId = getCurrentUserId();
			if (!userId) {
				if (isMounted) {
					setUser(null);
					setVeicoli([]);
					setIsLoading(false);
				}
				return;
			}
			try {
				const [userData, veicoliData] = await Promise.all([
					getUserById(userId),
					getVeicoliByUtenteId(userId),
				]);
				if (isMounted) {
					setUser(userData);
					setVeicoli(veicoliData);
				}
			} catch (err) {
				console.error('Errore nel caricamento profilo:', err);
				if (isMounted) {
					setError('Impossibile caricare il profilo.');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadProfile();
		return () => {
			isMounted = false;
		};
	}, []);

	async function handleUpdateUser(updatedUser) {
		if (updatedUser) {
			setUser(updatedUser);
		}
		setShowEditModal(false);
	}

	return (
		<div className="pp-profile-page">
			{isLoading && (
				<p className="pp-profile-page__empty">Caricamento profilo...</p>
			)}
			{!isLoading && error && (
				<p className="pp-profile-page__empty">{error}</p>
			)}
			{!isLoading && !error && !user && (
				<p className="pp-profile-page__empty">Nessun utente trovato. Effettua il login.</p>
			)}
			{user && (
				<ProfileHeader
					user={user}
					onEditClick={() => setShowEditModal(true)}
					onSettingsClick={() => setShowSettingsModal(true)}
				/>
			)}

			<div className="pp-profile-page__section">
				<h2 className="pp-profile-page__section-title">I tuoi veicoli</h2>
				<div className="pp-profile-page__vehicles">
					{veicoli.length > 0 ? (
						veicoli.map((veicolo) => (
							<VehicleCard key={veicolo.id} veicolo={veicolo} />
						))
					) : (
						<p className="pp-profile-page__empty">Nessun veicolo registrato</p>
					)}
				</div>
			</div>

			{showSettingsModal && (
				<SettingsModal onClose={() => setShowSettingsModal(false)} />
			)}

			{showEditModal && user && (
				<EditProfileModal
					user={user}
					onClose={() => setShowEditModal(false)}
					onUpdate={handleUpdateUser}
				/>
			)}
		</div>
	);
}
