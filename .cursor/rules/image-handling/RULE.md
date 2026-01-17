---
description: 'USE WHEN displaying images, handling image loading, and optimizing image performance.'
globs: ''
alwaysApply: false
---

# Image Handling

Standards for displaying and optimizing images.

## Basic Image Display

```tsx
// Always include alt text
<img
  src="/images/hero.jpg"
  alt="Team collaboration workspace"
  className="w-full h-auto"
/>

// Decorative images (screen readers skip)
<img
  src="/images/decoration.svg"
  alt=""
  aria-hidden="true"
/>
```

## Responsive Images

```tsx
// Object-fit for containers
<div className="w-full h-64">
  <img
    src={imageUrl}
    alt={altText}
    className="w-full h-full object-cover"
  />
</div>

// Object positions
className="object-cover object-center"
className="object-cover object-top"
className="object-contain"

// Aspect ratio containers
<div className="aspect-video">
  <img src={src} alt={alt} className="w-full h-full object-cover" />
</div>

<div className="aspect-square">
  <img src={src} alt={alt} className="w-full h-full object-cover" />
</div>
```

## Image with Loading State

```tsx
function ImageWithLoader({ src, alt, className }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <ImageOff className="w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
}
```

## Avatar Images

```tsx
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-medium',
        sizeClasses[size]
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
```

## Background Images

```tsx
// Inline style for dynamic images
<div
  className="h-64 bg-cover bg-center"
  style={{ backgroundImage: `url(${imageUrl})` }}
/>

// With overlay
<div
  className="relative h-64 bg-cover bg-center"
  style={{ backgroundImage: `url(${imageUrl})` }}
>
  <div className="absolute inset-0 bg-black/50" />
  <div className="relative z-10 p-6 text-white">
    Content over image
  </div>
</div>
```

## Lazy Loading

```tsx
// Native lazy loading
<img src={src} alt={alt} loading="lazy" className="w-full h-auto" />;

// With Intersection Observer for more control
function LazyImage({ src, alt, className }: ImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isVisible ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

## Stock Photos

When using stock photos, prefer Pexels:

```tsx
// Use direct Pexels URLs (don't download)
<img
  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
  alt="Team meeting in modern office"
/>
```
