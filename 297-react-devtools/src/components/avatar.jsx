// Simple Avatar component for reuse & React DevTools inspection
// Props:
//  - src: image URL
//  - alt: accessible alt text (defaults to 'Avatar')
//  - size: number (px) for width/height (defaults 48)
//  - rounded: boolean circle vs rounded square
//  - fallback: string/element shown when no src provided
//  - className: extra CSS classes
//  - ...props: passed to underlying element (e.g. onClick, aria-*)

import React from 'react';
import PropTypes from 'prop-types';

function Avatar({
	src,
	alt = 'Avatar',
	size = 48,
	rounded = true,
	fallback,
	className = '',
	style,
	...props
}) {
	const dimensionStyle = {
		width: size,
		height: size,
		objectFit: 'cover',
		borderRadius: rounded ? '50%' : 8,
		userSelect: 'none',
		...style,
	};

	if (!src) {
		return (
			<div
				className={`avatar-fallback ${className}`.trim()}
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#e2e8f0',
					color: '#475569',
					fontSize: Math.max(12, size * 0.45),
					fontWeight: 600,
					textTransform: 'uppercase',
					...dimensionStyle,
				}}
				role={fallback ? undefined : 'img'}
				aria-label={!fallback ? alt : undefined}
				{...props}
			>
				{fallback || alt?.[0] || '?'}
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			className={`avatar ${className}`.trim()}
			style={dimensionStyle}
			loading="lazy"
			draggable={false}
			{...props}
		/>
	);
}

Avatar.displayName = 'Avatar';

Avatar.propTypes = {
	src: PropTypes.string,
	alt: PropTypes.string,
	size: PropTypes.number,
	rounded: PropTypes.bool,
	fallback: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	className: PropTypes.string,
	style: PropTypes.object,
};

// Simplest version matching requested snippet usage.
// Usage: <CircleImgAvatar img="/path/to/pic.jpg" />
export function CircleImgAvatar(props) {
	return <img className="circle-img" src={props.img} alt="avatar_img" />;
}

export default Avatar;

