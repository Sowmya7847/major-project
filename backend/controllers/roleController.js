const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().select('-__v');
        res.status(200).json(roles);
    } catch (error) {
        console.error('Get Roles Error:', error);
        res.status(500).json({ message: 'Failed to fetch roles' });
    }
};

// @desc    Get single role by ID
// @route   GET /api/roles/:id
// @access  Private
const getRoleById = async (req, res) => {
    try {
        const role = await Role.findOne({ roleId: req.params.id });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json(role);
    } catch (error) {
        console.error('Get Role Error:', error);
        res.status(500).json({ message: 'Failed to fetch role' });
    }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin)
const createRole = async (req, res) => {
    try {
        const { roleId, name, description, permissions, policy } = req.body;

        const existingRole = await Role.findOne({ roleId });
        if (existingRole) {
            return res.status(400).json({ message: 'Role ID already exists' });
        }

        const role = await Role.create({
            roleId,
            name,
            description,
            permissions,
            policy,
            updatedBy: req.user._id
        });

        res.status(201).json(role);
    } catch (error) {
        console.error('Create Role Error:', error);
        res.status(500).json({ message: 'Failed to create role' });
    }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin)
const updateRole = async (req, res) => {
    try {
        const { name, description, permissions, policy, status } = req.body;

        const role = await Role.findOne({ roleId: req.params.id });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        role.name = name || role.name;
        role.description = description || role.description;
        role.permissions = permissions || role.permissions;
        role.policy = policy || role.policy;
        role.status = status || role.status;
        role.updatedBy = req.user._id;

        await role.save();

        res.status(200).json(role);
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ message: 'Failed to update role' });
    }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
const deleteRole = async (req, res) => {
    try {
        const role = await Role.findOneAndDelete({ roleId: req.params.id });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Delete Role Error:', error);
        res.status(500).json({ message: 'Failed to delete role' });
    }
};

module.exports = {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};
