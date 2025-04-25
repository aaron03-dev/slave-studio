import React, { useState } from 'react';
import '../assets/streamviews.css'

// Placeholder image URL (you can replace with your own image URLs)
const placeholderImage = 'https://i.pinimg.com/474x/39/dc/c6/39dcc67517f930db82932db15ad3f930.jpg';

// Create an array of 60 images with placeholder URLs
const images = Array.from({ length: 60 }, (_, index) => ({
    id: index + 1,
    src: placeholderImage,
}));

const StreamView = () => {
    const [enlargedImageId, setEnlargedImageId] = useState(null);

    const toggleEnlarge = (id) => {
        setEnlargedImageId(enlargedImageId === id ? null : id);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-6">Image Grid Gallery</h1>
            <div className="grid grid-cols-12 gap-4">
                {images.map((image) => {
                    const isEnlarged = enlargedImageId === image.id;
                    return (
                        <div
                            key={image.id}
                            className={`transition-all duration-300 ${isEnlarged ? 'col-span-12' : 'col-span-1'
                                }`}
                        >
                            <div className="flex flex-col items-center">
                                <p
                                    onClick={() => toggleEnlarge(image.id)}
                                    className="text-sm font-bold text-blue-500 hover:underline cursor-pointer mb-2"
                                >
                                    St {image.id}
                                </p>
                                <img
                                    src={image.src}
                                    alt={`Image ${image.id}`}
                                    className={`w-full h-auto object-cover rounded-lg shadow-md transition-all duration-300 ${isEnlarged ? 'max-h-[500px]' : 'max-h-40'
                                        }`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StreamView;