import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import gallery5 from '@/assets/gallery-5.jpg';
import gallery6 from '@/assets/gallery-6.jpg';
import gallery7 from '@/assets/gallery-7.jpg';
import gallery8 from '@/assets/gallery-8.jpg';
import gallery9 from '@/assets/gallery-9.jpg';
import gallery10 from '@/assets/gallery-10.jpg';
import gallery11 from '@/assets/gallery-11.jpg';
import gallery12 from '@/assets/gallery-12.jpg';
import gallery13 from '@/assets/gallery-13.jpg';
import gallery14 from '@/assets/gallery-14.jpg';
import gallery15 from '@/assets/gallery-15.jpg';
import gallery16 from '@/assets/gallery-16.jpg';
import gallery17 from '@/assets/gallery-17.jpg';
import gallery18 from '@/assets/gallery-18.jpg';
import gallery19 from '@/assets/gallery-19.jpg';
import gallery20 from '@/assets/gallery-20.jpg';
import galleryRow2_1 from '@/assets/gallery-row2-1.jpg';
import galleryRow2_2 from '@/assets/gallery-row2-2.jpg';
import galleryRow2_3 from '@/assets/gallery-row2-3.jpg';
import galleryRow2_4 from '@/assets/gallery-row2-4.jpg';
import galleryRow2_5 from '@/assets/gallery-row2-5.jpg';
import galleryRow2_6 from '@/assets/gallery-row2-6.jpg';
import galleryRow2_7 from '@/assets/gallery-row2-7.jpg';
import galleryRow2_8 from '@/assets/gallery-row2-8.jpg';
import galleryRow2_9 from '@/assets/gallery-row2-9.jpg';
import galleryRow2_10 from '@/assets/gallery-row2-10.jpg';
import galleryRow2_11 from '@/assets/gallery-row2-11.jpg';
import galleryRow2_12 from '@/assets/gallery-row2-12.jpg';
import galleryRow2_13 from '@/assets/gallery-row2-13.jpg';
import galleryRow2_14 from '@/assets/gallery-row2-14.jpg';

const imagesRow1 = [
  gallery1, gallery2, gallery3, gallery4, gallery5,
  gallery6, gallery7, gallery8, gallery9, gallery10,
  gallery11, gallery12, gallery13, gallery14, gallery15,
  gallery16, gallery17, gallery18, gallery19, gallery20,
];

const imagesRow2 = [
  galleryRow2_1, galleryRow2_2, galleryRow2_3, galleryRow2_4, galleryRow2_5,
  galleryRow2_6, galleryRow2_7, galleryRow2_8, galleryRow2_9, galleryRow2_10,
  galleryRow2_11, galleryRow2_12, galleryRow2_13, galleryRow2_14,
];

const allImages = [...imagesRow1, ...imagesRow2];

const MissionSection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? allImages.length - 1 : selectedImage - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === allImages.length - 1 ? 0 : selectedImage + 1);
    }
  };

  const ImageCard = ({ image, index }: { image: string; index: number }) => (
    <div
      className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
      onClick={() => openLightbox(index)}
    >
      <img
        src={image}
        alt={`กิจกรรม ${index + 1}`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
          <span className="text-primary-foreground text-xl">+</span>
        </div>
      </div>
    </div>
  );

  return (
    <section id="mission" className="section-padding bg-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 px-2">
          <span className="inline-block text-primary font-medium mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">
            กิจกรรมการเรียนรู้ของเรา
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            ให้เด็กๆ ได้ฝึกฝนทักษะเอาตัวรอด
            <span className="gradient-text"> รับมือในทุกวิกฤต</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            ทักษะที่เป็นประโยชน์นี้ จะติดตัวเด็กๆ ไปตลอดชีวิต
          </p>
        </div>

        {/* First Row Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {imagesRow1.map((image, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ImageCard image={image} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6" />
        </Carousel>

        {/* Second Row Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full mt-4"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {imagesRow2.map((image, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ImageCard image={image} index={imagesRow1.length + index} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6" />
        </Carousel>

        {/* Mobile swipe hint */}
        <p className="text-center text-muted-foreground text-sm mt-4 md:hidden">
          เลื่อนเพื่อดูภาพเพิ่มเติม →
        </p>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-0 bg-background/95 backdrop-blur-sm border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-foreground/20 hover:bg-foreground/30 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            {/* Previous button */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-4 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-foreground/20 hover:bg-foreground/30 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
            </button>

            {/* Image */}
            {selectedImage !== null && (
              <img
                src={allImages[selectedImage]}
                alt={`กิจกรรม ${selectedImage + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            )}

            {/* Next button */}
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-foreground/20 hover:bg-foreground/30 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground/20 px-4 py-2 rounded-full">
              <span className="text-foreground text-sm">
                {selectedImage !== null ? selectedImage + 1 : 0} / {allImages.length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MissionSection;
