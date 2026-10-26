import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const getStaff = async (req, res) => {
    try {
        const filter = {
            role: { $in: ['Technician', 'Warden'] }
        };

        if (req.query.hostel) {
            filter.hostel = req.query.hostel;
        }

        const staff = await User.find(filter)
            .select('-password')
            .sort({ hostel: 1, role: -1, fullname: 1 });

        return res.status(200).json({
            success: true,
            count: staff.length,
            staff
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve staff list.',
            error: error.message
        });
    }
};

export const getTechnicians = async (req, res) => {
    try {
        const technicians = await User.find({ role: 'Technician' })
            .select('-password')
            .sort({ fullname: 1 });

        return res.status(200).json({
            success: true,
            technicians
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve technicians.',
            error: error.message
        });
    }
};

/**
 * POST /api/users/staff
 * Administrative onboarding: Only authenticated Wardens can onboard new Technicians/Wardens
 */
export const createStaffMember = async (req, res) => {
    try {
        const { fullname, email, password, role, hostel, phone, specialization } = req.body;

        if (!fullname || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Fullname, email, temporary password, and role are required.'
            });
        }

        const validRoles = ['Warden', 'Technician'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Staff role must be either: ${validRoles.join(', ')}`
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email address already exists.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const validHostels = ['Neeladri Hostel', 'Velankani Hostel'];
        const selectedHostel = validHostels.includes(hostel) ? hostel : (req.user?.hostel || 'Neeladri Hostel');
        const cleanSpecialization = role === 'Technician' ? (specialization || 'General') : '';
        const locationDesc = role === 'Warden'
            ? `${selectedHostel}, Warden Administration Office`
            : `${selectedHostel}, Maintenance (${cleanSpecialization})`;

        const newStaff = await User.create({
            fullname,
            email: normalizedEmail,
            password: hashedPassword,
            role,
            hostel: selectedHostel,
            location: locationDesc,
            specialization: cleanSpecialization,
            phone: phone || ''
        });

        return res.status(201).json({
            success: true,
            message: `${role} account for ${fullname} provisioned successfully.`,
            staff: newStaff
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to provision staff member.',
            error: error.message
        });
    }
};
