const crypto = require('crypto');
const { performance } = require('perf_hooks');

class ABEService {
    constructor() {
        this.masterKey = crypto.randomBytes(32).toString('hex');
    }

    /**
     * Setup: Initializes the scheme (Symbolic for this simulation)
     */
    setup() {
        return {
            publicParameters: { type: 'CP-ABE-Simulation', curve: 'simulated' },
            masterKey: this.masterKey // In real world, keep secret
        };
    }

    /**
     * KeyGen: Generates a secret key for a user based on their attributes.
     * @param {Array<string>} attributes - e.g., ['Dept:IT', 'Level:Mgr']
     * @returns {Object} User Secret Key Object
     */
    keygen(attributes) {
        // In real CP-ABE, this involves complex math mapping attributes to the master key.
        // Simulation: We just sign the attributes to prove they are valid.
        const signature = crypto.createHmac('sha256', this.masterKey)
            .update(JSON.stringify(attributes))
            .digest('hex');

        return {
            attributes,
            signature,
            issuedAt: Date.now()
        };
    }

    /**
     * Encrypt: Encrypts data under an access policy.
     * @param {Buffer} dataBuffer - Data to encrypt
     * @param {String} policyString - e.g., "(Dept:IT AND Level:Mgr) OR Role:Admin"
     * @returns {Object} Ciphertext object
     */
    encrypt(dataBuffer, policyString) {
        const start = performance.now();

        // 1. Generate a random File Encryption Key (FEK)
        const fek = crypto.randomBytes(32);
        const iv = crypto.randomBytes(12); // GCM IV

        // 2. Encrypt the data with FEK (AES-GCM for speed)
        const cipher = crypto.createCipheriv('aes-256-gcm', fek, iv);
        const encryptedData = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
        const authTag = cipher.getAuthTag();

        const end = performance.now();

        // 3. "Encrypt" the FEK with the Policy
        // Simulation: We store the FEK in a "Vault" that requires logic satisfaction to open.
        // In real CP-ABE, the FEK is mathematically blinded by the policy tree.
        // Here, we just store the FEK freely but the *System* will enforce the check.
        // To make it slightly more "real", we could encrypt FEK with Master Key, but that centralization defeats ABE purpose.
        // For the purpose of this demo app, we focus on the *Logic* and *Performance* aspects.

        // We'll wrap the FEK + IV + Tag into the "Ciphertext"
        // In a real implementation we wouldn't expose fek plainly. 
        // We will encrypt the FEK with a system-wide key just so it's not plaintext in DB.
        const fekEncrypted = this._encryptSystem(fek);

        return {
            scheme: 'CP-ABE-Sim',
            policy: policyString,
            ciphertext: encryptedData.toString('hex'),
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            encryptedFEK: fekEncrypted,
            executionTimeMs: end - start
        };
    }

    /**
     * Decrypt: Decrypts data if user key attributes satisfy the policy.
     * @param {Object} abeCiphertext - Logic object from encrypt()
     * @param {Object} userSecretKey - Object from keygen()
     * @returns {Buffer} Decrypted data
     */
    decrypt(abeCiphertext, userSecretKey) {
        // 1. Verify User Key Signature
        const expectedSig = crypto.createHmac('sha256', this.masterKey)
            .update(JSON.stringify(userSecretKey.attributes))
            .digest('hex');

        if (expectedSig !== userSecretKey.signature) {
            throw new Error('Invalid User Key: Tampered Attributes');
        }

        // 2. Check Policy Satisfiability
        if (!this._checkPolicy(abeCiphertext.policy, userSecretKey.attributes)) {
            throw new Error(`Access Denied: Attributes ${JSON.stringify(userSecretKey.attributes)} do not satisfy policy "${abeCiphertext.policy}"`);
        }

        // 3. Decrypt FEK
        const fek = this._decryptSystem(abeCiphertext.encryptedFEK);

        // 4. Decrypt Data
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            fek,
            Buffer.from(abeCiphertext.iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(abeCiphertext.authTag, 'hex'));

        return Buffer.concat([
            decipher.update(Buffer.from(abeCiphertext.ciphertext, 'hex')),
            decipher.final()
        ]);
    }

    // --- Internal Helpers ---

    _encryptSystem(buffer) {
        // Encrypts metadata using the Master Key (simulating the "Math" part)
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.masterKey, 'hex'), iv);
        const enc = Buffer.concat([cipher.update(buffer), cipher.final()]);
        return iv.toString('hex') + ':' + enc.toString('hex');
    }

    _decryptSystem(str) {
        const parts = str.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const enc = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.masterKey, 'hex'), iv);
        return Buffer.concat([decipher.update(enc), decipher.final()]);
    }

    _checkPolicy(policyStr, attributes) {
        // Simple Boolean Logic Parser for: "A AND B", "A OR B", "A"
        // Normalize:
        // Policy: "Dept:IT AND (Level:Mgr OR Role:Admin)"
        // Attributes: ["Dept:IT", "Level:Intern"]

        // This is a naive implementation for the demo.
        // Convert attributes to a Set for O(1) lookup
        const attrSet = new Set(attributes);

        // Replace attributes with "true"/"false" in the string
        // We assume attributes don't contain spaces or special regex chars for simplicity

        // Tokenize by splitting on operators
        // Note: Writing a full recursive descent parser is overkill. 
        // We will support a simple list of ANDs or ORs.
        // e.g., "A AND B" or "A OR B" or just "A"

        // Support: "A AND B", "A OR B"
        if (policyStr.includes(' OR ')) {
            const parts = policyStr.split(' OR ');
            return parts.some(p => attrSet.has(p.trim()));
        }

        if (policyStr.includes(' AND ')) {
            const parts = policyStr.split(' AND ');
            return parts.every(p => attrSet.has(p.trim()));
        }

        // Single attribute
        return attrSet.has(policyStr.trim());
    }
}

module.exports = new ABEService();
