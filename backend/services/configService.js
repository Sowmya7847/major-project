const SecurityConfig = require('../models/SecurityConfig');

class ConfigService {
    constructor() {
        this.config = null;
        this.lastFetched = null;
        this.cacheTTL = 60000; // 1 minute
    }

    /**
     * Get system configuration, with caching
     */
    async getConfig() {
        if (!this.config || (Date.now() - this.lastFetched > this.cacheTTL)) {
            console.log('[CONFIG] Refreshing system configuration from DB...');
            this.config = await SecurityConfig.getConfig();
            this.lastFetched = Date.now();
        }
        return this.config;
    }

    /**
     * Get a specific setting
     */
    async get(key) {
        const config = await this.getConfig();
        return config[key];
    }

    /**
     * Update system configuration
     */
    async updateConfig(updateData, userId) {
        let config = await SecurityConfig.findOne();
        if (!config) {
            config = new SecurityConfig();
        }

        Object.assign(config, updateData);
        config.updatedBy = userId;
        config.lastUpdated = Date.now();

        await config.save();
        this.config = config; // Update cache
        this.lastFetched = Date.now();

        return config;
    }
}

module.exports = new ConfigService();
