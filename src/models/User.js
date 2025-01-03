const mongoose = require('mongoose');

// Define the schema for the User model
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String
        },
        profilePicture: {
            type: String
        },
        addresses: [
            {
                street: {
                    type: String
                },
                city: {
                    type: String
                },
                postalCode: {
                    type: String
                },
                coordinates: {
                    latitude: {
                        type: Number 
                    },
                    longitude: {
                        type: Number
                    }
                }
            }
        ],
        googleId: {
            type: String
        }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
        collection: 'Users' // Explicitly set the collection name
    }
);

// Create and export the User model
const User = mongoose.model('Users', userSchema);
module.exports = User;
