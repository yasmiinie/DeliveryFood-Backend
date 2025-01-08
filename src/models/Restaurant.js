const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        logo: {
            type: String
        },
        coverImage: {
            type: String
        },
        description: {
            type: String
        },
        deliveryTime: {
            min: {
                type: Number,  // in minutes
                required: true,
                default: 30
            },
            max: {
                type: Number,  // in minutes
                required: true,
                default: 45
            }
        },
        keywords: [String],
        cuisineType: [String],
        address: {
            street: String,
            city: String,
            postalCode: String
        },
        location: {
            type: { 
                type: String, 
                enum: ['Point'], 
                required: true 
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
        contactInfo: {
            phone: String,
            email: String
        },
        socialMedia: {
            facebook: String,
            instagram: String,
            twitter: String
        },
        openingHours: [{
            day: Number,
            open: String,
            close: String
        }],
        rating: {
            average: {
                type: Number,
                default: 0
            },
            count: {
                type: Number,
                default: 0
            }
        },
        isActive: {
            type: Boolean,
            default: true
        },
        deliveryFee: {  
            type: Number,
            required: true,
            default: 0  
        }
    },
    { 
        timestamps: true, 
        collection: 'restaurants' 
    }
);

// Indexes for geospatial queries and text search
restaurantSchema.index({ location: '2dsphere' }); // GeoSpatial Index
restaurantSchema.index({ name: 'text', description: 'text', keywords: 'text' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
