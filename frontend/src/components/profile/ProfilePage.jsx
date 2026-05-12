import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import VehicleCard from './VehicleCard';
import SettingsButton from './SettingsButton';
import SettingsModal from './SettingsModal';
import EditProfileModal from './EditProfileModal';
import './ProfilePage.css';

// Mock data
const mockUser = {
	id: '550e8400-e29b-41d4-a716-446655440000',
	nome: 'Marco',
	cognome: 'Rossi',
	email: 'marco.rossi@example.com',
	role_id: 2,
	is_active: true,
	created_at: '2025-01-15T10:30:00Z',
	updated_at: '2025-01-15T10:30:00Z',
};

const mockVeicoli = [
	{
		id: '660e8400-e29b-41d4-a716-446655440001',
		utente_id: '550e8400-e29b-41d4-a716-446655440000',
		targa: 'BG123CD',
		marca: 'Fiat',
		modello: 'Panda',
		tipo: 'auto',
	},
	{
		id: '660e8400-e29b-41d4-a716-446655440002',
		utente_id: '550e8400-e29b-41d4-a716-446655440000',
		targa: 'BS456EF',
		marca: 'Vespa',
		modello: 'Primavera',
		tipo: 'scooter',
	},
];

export default function ProfilePage() {
	const [user, setUser] = useState(mockUser);
	const [veicoli, setVeicoli] = useState(mockVeicoli);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);

	async function handleUpdateUser(updates) {
		// Mock update - in future: await updateUser(user.id, updates)
		setUser({ ...user, ...updates });
		setShowEditModal(false);
	}

	return (
		<div className="pp-profile-page">
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
