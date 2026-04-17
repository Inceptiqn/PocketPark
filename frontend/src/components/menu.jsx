import Button from './button';
import './menu.css';

const defaultItems = [
	{
		id: 'home',
		imageSrc: 'https://www.svgrepo.com/show/512352/home-1393.svg',
		imageAlt: 'Home',
		ariaLabel: 'Home',
	},
	{
		id: 'position',
		imageSrc: 'https://www.svgrepo.com/show/532548/map-pin-alt.svg',
		imageAlt: 'Posizione',
		ariaLabel: 'Posizione',
	},
	{
		id: 'add',
		imageSrc: 'https://www.svgrepo.com/show/513803/add.svg',
		imageAlt: 'Aggiungi',
		ariaLabel: 'Aggiungi',
	},
	{
		id: 'cars',
		imageSrc: 'https://www.svgrepo.com/show/96732/parking-time.svg',
		imageAlt: 'Auto',
		ariaLabel: 'Auto',
	},
	{
		id: 'profile',
		imageSrc: 'https://www.svgrepo.com/show/532363/user-alt-1.svg',
		imageAlt: 'Profilo',
		ariaLabel: 'Profilo',
	},
];

function Menu({ items = defaultItems, activeId = 'home', onItemClick }) {
	return (
		<nav className="pp-menu" aria-label="Menu principale">
			{items.map((item) => {
				const isActive = item.id === activeId;

				return (
					<Button
						key={item.id}
						imageSrc={item.imageSrc}
						imageAlt={item.imageAlt}
						ariaLabel={item.ariaLabel}
						className={`pp-menu__action ${isActive ? 'is-active' : ''}`}
						onClick={() => onItemClick?.(item.id)}
					/>
				);
			})}
		</nav>
	);
}

export default Menu;
