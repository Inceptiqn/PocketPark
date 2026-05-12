import './search.css';
import { useSearchController } from './search.js';

function Search({ onSelect, placeholder = 'Cerca una via o un indirizzo' }) {
	const {
		query,
		setQuery,
		results,
		loading,
		error,
		handleSelect,
		handleSubmit,
		handleKeyDown,
		executeImmediateSearch,
	} = useSearchController({ onSelect });

	return (
		<div className="pp-search" role="search">
			<label className="pp-search__label" htmlFor="pp-map-search">
				Cerca indirizzo
			</label>
			<form className="pp-search__field" onSubmit={handleSubmit}>
				<input
					id="pp-map-search"
					className="pp-search__input"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					autoComplete="off"
					spellCheck="false"
				/>
				<button type="submit" className="pp-search__submit" aria-label="Cerca indirizzo" onClick={executeImmediateSearch}>
					🔍
				</button>
				{loading ? <span className="pp-search__status">...</span> : null}
			</form>

			{error && !loading ? <p className="pp-search__message">{error}</p> : null}

			{results.length > 0 ? (
				<ul className="pp-search__results" aria-label="Suggerimenti indirizzi">
					{results.map((item) => (
						<li key={item.id}>
							<button type="button" className="pp-search__result" onClick={() => handleSelect(item)}>
								<span className="pp-search__result-title">{item.name}</span>
								<span className="pp-search__result-meta">{item.type}</span>
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

export default Search;