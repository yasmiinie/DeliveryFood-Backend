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
            required: function() {
                // 'password' is required only if googleId is not present
                return !this.googleId;
            }
        },
        phoneNumber: {
            type: String
        },
        profilePicture: {
            type: String
        },
        bio: {
            type: String,
            default: "null" // Defaults to a string "null" if not provided
        },
        addresses: [
            {
                title: {
                    type: String
                },
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
