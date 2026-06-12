import React from 'react';

// Reusable Avatar component. Keeps styling concerns local.
function Avatar({ src, alt = 'Avatar', size = 64 }) {
  return (
    <img
      className="circle-img"
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ objectFit: 'cover' }}
    />
  );
}

export default Avatar;
