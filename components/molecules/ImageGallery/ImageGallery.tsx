import ImageThumbnails from 'components/atoms/ImageThumbnails';
import { layoutFillConfig } from 'lib/utils/image';
import Image from 'components/atoms/SafeImage';
import React, { useState, useCallback, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { MandatoryImageProps } from 'types/global';
import SlideNav from '../../atoms/SlideNav';

export interface ImageGalleryProps {
  images: MandatoryImageProps[];
  aspectRatio?: `${number}/${number}`;
  selectedVariant?: string;
}

const getImageClassName = (
  index: number,
  currentSlide: number,
  length: number,
) => {
  const prevIndex = currentSlide - 1 >= 0 ? currentSlide - 1 : length - 1;
  const nextIndex = currentSlide + 1 <= length - 1 ? currentSlide + 1 : 0;

  if (index === currentSlide) return 'left-0 lg:left-0 lg:opacity-100 z-10';
  else if (index === prevIndex) return '-left-full lg:left-0 lg:opacity-0';
  else if (index === nextIndex) return 'left-full lg:left-0 lg:opacity-0';

  return 'hidden lg:flex lg:left-0 lg:opacity-0';
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  aspectRatio,
  selectedVariant,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const setPrevSlide = useCallback(
    () =>
      setCurrentSlide((prev) => (prev - 1 >= 0 ? prev - 1 : images.length - 1)),
    [images.length],
  );

  const setNextSlide = useCallback(
    () =>
      setCurrentSlide((prev) => (prev + 1 <= images.length - 1 ? prev + 1 : 0)),
    [images.length],
  );

  const handlers = useSwipeable({
    onSwipedLeft: setNextSlide,
    onSwipedRight: setPrevSlide,
    preventDefaultTouchmoveEvent: true,
  });

  useEffect(() => {
    // Ensure selectedVariant is not empty
    if (!selectedVariant) {
      return;
    }

    // Extract the second part after the second slash in the selectedVariant URL
    const selectedVariantParts = selectedVariant.split('/');
    const secondPartInVariant =
      selectedVariantParts.length > 1 ? selectedVariantParts[5] : '';

    // Find the index of the image with a matching second part in the URL
    const selectedIndex = images.findIndex((image, index) => {
      // Extract the last two parts after the second slash in the URL
      const urlParts = (image.src as string).split('/');
      const lastTwoParts = urlParts.slice(-2);

      // Check if the last two parts match
      const isMatch = lastTwoParts[1] === secondPartInVariant;

      // Update the current slide if the selectedVariant image is found
      if (isMatch) {
        setCurrentSlide(index);
      }

      return isMatch;
    });

    // Update the current slide if the selectedVariant image is found
    if (selectedIndex !== -1) {
      setCurrentSlide(selectedIndex);
    }
  }, [selectedVariant, images]);

  return (
    <div className="relative w-full select-text">
      <div className="sticky top-full z-20 h-0">
        <ImageThumbnails
          className="hidden w-fit -translate-y-full pb-8 pl-8 lg:flex"
          images={images}
          imageSize={47}
          value={currentSlide}
          onChange={(value) => {
            setCurrentSlide(value);
          }}
        />
      </div>
      <div
        {...handlers}
        className="align-center relative flex w-full justify-center overflow-hidden lg:w-auto"
        style={{
          aspectRatio,
        }}>
        {images.map((image, i) => {
          return (
            <div
              key={image.src.toString()}
              aria-hidden={i !== currentSlide ? 'true' : undefined}
              tabIndex={-1}
              className={`absolute flex h-full w-full items-center justify-center transition-all lg:transition-opacity ${getImageClassName(
                i,
                currentSlide,
                images.length,
              )}`}>
              <div className="h-full w-full">
                <Image
                  {...image}
                  alt={image.alt}
                  className={['object-cover', image.className].join(' ')}
                  {...layoutFillConfig}
                />
              </div>
            </div>
          );
        })}
      </div>

      <SlideNav
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 -translate-y-full lg:hidden"
        quantity={images.length}
        value={currentSlide}
        disabled
      />

      <div className="sr-only">
        Image {currentSlide + 1} of {images.length}
      </div>
    </div>
  );
};

export default ImageGallery;
