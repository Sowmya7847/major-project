const crypto = require('crypto');
const { performance } = require('perf_hooks');

// Lightweight: AES-256-GCM (Authenticated Encryption, Optimized)
const encryptLightweight = (buffer, key) => {
    const start = performance.now();
    const iv = crypto.randomBytes(12); // GCM standard IV size
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const end = performance.now();

    return {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        encryptedData: encrypted.toString('hex'),
        algorithm: 'aes-256-gcm',
        executionTimeMs: end - start
    };
};

const decryptLightweight = (encryptedHex, key, ivHex, authTagHex) => {
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(key, 'hex'),
        Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
    return decrypted;
};

// Heavy: 3DES (Legacy, Slower, Unoptimized simulation) or AES-CBC with many rounds
// Using 3DES (des-ede3-cbc) as it's significantly slower and good for comparison
const encryptHeavy = (buffer, key) => {
    // 3DES requires 24 byte key. We'll slice the 32 byte key or hash it to fit.
    const key3des = Buffer.from(key, 'hex').slice(0, 24);
    const start = performance.now();

    // 3DES block size is 8 bytes
    const iv = crypto.randomBytes(8);
    const cipher = crypto.createCipheriv('des-ede3-cbc', key3des, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    const end = performance.now();

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
        algorithm: 'des-ede3-cbc',
        executionTimeMs: end - start
    };
};

const decryptHeavy = (encryptedHex, key, ivHex) => {
    const key3des = Buffer.from(key, 'hex').slice(0, 24);
    const decipher = crypto.createDecipheriv(
        'des-ede3-cbc',
        key3des,
        Buffer.from(ivHex, 'hex')
    );

    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
    return decrypted;
};

// Key Generation
const generateKey = () => {
    return crypto.randomBytes(32).toString('hex'); // 256 bits
};

module.exports = {
    encryptLightweight,
    decryptLightweight,
    encryptHeavy,
    decryptHeavy,
    generateKey
};
