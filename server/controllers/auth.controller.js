import bcrypt from 'bcrypt';
import User from '../models/User.js';
import genToken from '../utils/generateToken.js';
import cookiesOption from '../utils/cookiesOption.js';

export const register = async (req, res) => {
    try {
        const { fullname, email, password, hostel, roomNumber, location, phone } = req.body;

        const selectedHostel = hostel || 'Neeladri Hostel';
        const finalRoom = roomNumber ? roomNumber.trim().toUpperCase() : '';
        const finalLocation = (finalRoom && selectedHostel) ? `${selectedHostel}, Room ${finalRoom}` : (location || `${selectedHostel}`);

        if (!fullname || !email || !password || !finalRoom) {
            return res.status(400).json({
                success: false,
                message: 'Fullname, email, password, hostel selection, and room number are required.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email address already exists.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullname,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'Student',
            hostel: selectedHostel,
            roomNumber: finalRoom,
            location: finalLocation,
            phone: phone || ''
        });

        const token = genToken(newUser._id);
        res.cookie('token', token, cookiesOption);

        return res.status(201).json({
            success: true,
            message: 'Student account registered successfully.',
            user: newUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error during registration.',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user account found with this email.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password entered.'
            });
        }

        const token = genToken(user._id);
        res.cookie('token', token, cookiesOption);

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login.',
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        const { maxAge, ...clearOptions } = cookiesOption;
        res.clearCookie('token', clearOptions);
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to logout cleanly.',
            error: error.message
        });
    }
};

export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'User session verified.',
            user: req.user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user session.',
            error: error.message
        });
    }
};

/**
 * PUT /api/auth/change-password
 * Allows any authenticated user (Student, Technician, Warden) to update password
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long.'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password entered is incorrect.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update password.',
            error: error.message
        });
    }
};

/**
 * PUT /api/auth/profile
 * Allows user to update their name, phone, room number (students), or trade specialization (technicians)
 */
export const updateProfile = async (req, res) => {
    try {
        const { fullname, phone, roomNumber, hostel, specialization } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
            });
        }

        if (fullname && fullname.trim()) {
            user.fullname = fullname.trim();
        }

        if (phone !== undefined) {
            user.phone = phone.trim();
        }

        // Student-specific profile updates
        if (user.role === 'Student') {
            const validHostels = ['Neeladri Hostel', 'Velankani Hostel'];
            if (hostel && validHostels.includes(hostel)) {
                user.hostel = hostel;
            }

            if (roomNumber !== undefined && roomNumber.trim()) {
                const cleanRoom = roomNumber.trim().toUpperCase();
                user.roomNumber = cleanRoom;
                user.location = `${user.hostel}, Room ${cleanRoom}`;
            }
        } else if (user.role === 'Technician') {
            // Technician trade specialization update
            if (specialization && specialization.trim()) {
                user.specialization = specialization.trim();
                user.location = `${user.hostel}, Maintenance (${user.specialization})`;
            }
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update profile.',
            error: error.message
        });
    }
};
