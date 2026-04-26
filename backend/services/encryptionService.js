const crypto = require('crypto');
const { performance } = require('perf_hooks');

const configService = require('./configService');

/**
 * Encrypt data using an algorithm from system config or provided meta
 */
const encryptBuffer = async (buffer, key, options = {}) => {
    const config = await configService.getConfig();
    const algorithm = options.algorithm || config.encryptionMode;
    const start = performance.now();

    let iv, cipher, encrypted, authTag;

    switch (algorithm) {
        case 'AES-256-GCM':
            iv = crypto.randomBytes(12);
            cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
            encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
            authTag = cipher.getAuthTag();
            break;
        case 'ChaCha20-Poly1305':
            iv = crypto.randomBytes(12);
            cipher = crypto.createCipheriv('chacha20-poly1305', Buffer.from(key, 'hex'), iv, { authTagLength: 16 });
            encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
            authTag = cipher.getAuthTag();
            break;
        case 'AES-256-CBC':
            iv = crypto.randomBytes(16);
            cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
            encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
            authTag = null; // No auth tag for CBC
            break;
        default:
            throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    const end = performance.now();

    return {
        iv: iv.toString('hex'),
        authTag: authTag ? authTag.toString('hex') : null,
        encryptedData: encrypted.toString('hex'),
        algorithm,
        executionTimeMs: end - start
    };
};

/**
 * Decrypt data using provided metadata
 */
const decryptBuffer = (encryptedHex, key, meta) => {
    const { algorithm, iv, authTag } = meta;
    let decipher;

    switch (algorithm) {
        case 'AES-256-GCM':
            decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
            break;
        case 'ChaCha20-Poly1305':
            decipher = crypto.createDecipheriv('chacha20-poly1305', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'), { authTagLength: 16 });
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
            break;
        case 'AES-256-CBC':
            decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
            break;
        default:
            throw new Error(`Unsupported decryption algorithm: ${algorithm}`);
    }

    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
    return decrypted;
};

// Key Generation
const generateKey = () => {
    return crypto.randomBytes(32).toString('hex'); // 256 bits
};

module.exports = {
    encryptBuffer,
    decryptBuffer,
    generateKey
};
