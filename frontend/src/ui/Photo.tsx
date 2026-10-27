import styles from './Photo.module.css';

interface PhotoProps {
  name: string;
  alt: string;
  sizes: string;
  className?: string;
}

// Photos live in public/photos as <name>-800.webp and <name>-1600.webp.
export default function Photo({ name, alt, sizes, className }: PhotoProps) {
  return (
    <div className={`${styles.frame} ${className ?? ''}`}>
      <img
        src={`/photos/${name}-1600.webp`}
        srcSet={`/photos/${name}-800.webp 800w, /photos/${name}-1600.webp 1600w`}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
