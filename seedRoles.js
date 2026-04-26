const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./backend/models/Role');

dotenv.config();

const seedRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing roles
        await Role.deleteMany({});

        const roles = [
            {
                roleId: 'super-admin',
                name: 'Super Admin',
                description: 'Full access to all resources',
                status: 'active',
                permissions: [
                    { resourceName: 'S3 Buckets', resourceGroup: 'Standard Storage', read: true, write: true, execute: false, delete: true },
                    { resourceName: 'EC2 Instances', resourceGroup: 'Compute Nodes', read: true, write: true, execute: true, delete: true },
                    { resourceName: 'KMS Keys', resourceGroup: 'Encryption Management', read: true, write: true, execute: false, delete: true },
                    { resourceName: 'Route 53', resourceGroup: 'DNS Zones', read: true, write: true, execute: false, delete: true }
                ],
                policy: {
                    version: '2.0',
                    statement: [
                        { effect: 'Allow', action: ['s3:*'], resource: '*' },
                        { effect: 'Allow', action: ['ec2:*'], resource: '*' },
                        { effect: 'Allow', action: ['kms:*'], resource: '*' }
                    ],
                    condition: { notIpAddress: { 'aws:SourceIp': ['10.0.0.0/8'] } }
                }
            },
            {
                roleId: 'devops',
                name: 'DevOps Engineer',
                description: 'Deploy & Manage Nodes',
                status: 'active',
                permissions: [
                    { resourceName: 'EC2 Instances', resourceGroup: 'Compute Nodes', read: true, write: true, execute: true, delete: false },
                    { resourceName: 'S3 Buckets', resourceGroup: 'Standard Storage', read: true, write: false, execute: false, delete: false }
                ],
                policy: {
                    version: '2.0',
                    statement: [
                        { effect: 'Allow', action: ['ec2:Describe*', 'ec2:Start*', 'ec2:Stop*'], resource: '*' },
                        { effect: 'Allow', action: ['s3:Get*', 's3:List*'], resource: '*' }
                    ]
                }
            },
            {
                roleId: 'auditor',
                name: 'Auditor',
                description: 'Read-only logs access',
                status: 'active',
                permissions: [
                    { resourceName: 'Audit Logs', resourceGroup: 'Monitoring', read: true, write: false, execute: false, delete: false },
                    { resourceName: 'S3 Buckets', resourceGroup: 'Standard Storage', read: true, write: false, execute: false, delete: false }
                ],
                policy: {
                    version: '2.0',
                    statement: [
                        { effect: 'Allow', action: ['logs:Get*', 'logs:Describe*'], resource: '*' },
                        { effect: 'Allow', action: ['s3:Get*', 's3:List*'], resource: '*' }
                    ]
                }
            },
            {
                roleId: 'storage-manager',
                name: 'Storage Manager',
                description: 'S3 Bucket Management',
                status: 'active',
                permissions: [
                    { resourceName: 'S3 Buckets', resourceGroup: 'Standard Storage', read: true, write: true, execute: false, delete: true }
                ],
                policy: {
                    version: '2.0',
                    statement: [
                        { effect: 'Allow', action: ['s3:*'], resource: '*' }
                    ]
                }
            }
        ];

        await Role.insertMany(roles);
        console.log('✅ Roles seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedRoles();
