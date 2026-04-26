const FileRecord = require('../models/FileRecord');
const monitoringService = require('../services/monitoringService');

class QueueService {
    /**
     * Add a new file processing task to the queue (DB-backed)
     */
    async addTask(fileData) {
        try {
            const task = await FileRecord.create({
                ...fileData,
                status: 'pending'
            });

            await monitoringService.logActivity({
                userId: fileData.user,
                eventType: 'FILE_QUEUED',
                status: 'success',
                message: `File ${fileData.originalName} queued for processing`,
                metadata: { fileId: task._id }
            });

            return task;
        } catch (error) {
            console.error('[QUEUE] Error adding task:', error.message);
            throw error;
        }
    }

    /**
     * Get next pending task for a worker
     */
    async getNextTask(workerId) {
        return await FileRecord.findOneAndUpdate(
            { status: 'pending' },
            { status: 'processing', processedBy: workerId },
            { returnDocument: 'after', sort: { createdAt: 1 } }
        );
    }
}

module.exports = new QueueService();
