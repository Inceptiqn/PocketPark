import { useEffect, useState } from 'react';
import './stat.css';

function Stats({
	label = 'TEMPO RIMASTO',
	current = 82,
	max = 100,
	value,
	fillColor = '#4e69ea',
	variant = 'progress',
	className = '',
	style,
	animate = true,
}) {
	const safeMax = max > 0 ? max : 100;
	const clampedCurrent = Math.max(0, Math.min(current, safeMax));
	const targetProgress = clampedCurrent / safeMax;
	const [animatedProgress, setAnimatedProgress] = useState(animate ? 0 : targetProgress);
	const displayValue = value || `${clampedCurrent}/${safeMax}`;
	const isEmpty = variant === 'empty';

	useEffect(() => {
		if (isEmpty) {
			setAnimatedProgress(0);
			return undefined;
		}

		if (!animate) {
			setAnimatedProgress(targetProgress);
			return undefined;
		}

		let frameId = 0;
		const startTime = window.performance.now();
		const duration = 900;

		const animateProgress = (time) => {
			const elapsed = time - startTime;
			const linearProgress = Math.min(elapsed / duration, 1);
			const easedProgress = 1 - Math.pow(1 - linearProgress, 3);
			setAnimatedProgress(targetProgress * easedProgress);

			if (linearProgress < 1) {
				frameId = window.requestAnimationFrame(animateProgress);
			}
		};

		frameId = window.requestAnimationFrame(animateProgress);

		return () => window.cancelAnimationFrame(frameId);
	}, [animate, targetProgress]);

	const componentStyle = {
		'--stats-progress': animatedProgress,
		'--stats-fill': fillColor,
		'--stats-start-angle': '0deg',
		...style,
	};

	return (
		<section className={`pp-stats ${isEmpty ? 'is-empty' : ''} ${className}`.trim()} style={componentStyle} aria-label={label}>
			<p className="pp-stats__label">{label}</p>
			<div className="pp-stats__ring" role="img" aria-label={`${label}: ${displayValue}`}>
				{!isEmpty ? <span className="pp-stats__value">{displayValue}</span> : null}
			</div>
		</section>
	);
}

export default Stats;