import { Queue } from "bullmq";

// 1. Redis Connection Settings
// Fortune 500 companies hamesha connection details ko separate rakhti hain.
const connection = {
    host: "127.0.0.1", 
    port: 6379         
};

// 2. Queue Create Karein
// Iska naam humne "workflow-queue" rakha hai.
export const workflowQueue = new Queue("workflow-queue", { connection });

/**
 * Helper Function: Workflow ko Redis mein dalne ke liye
 */
export async function addJobToQueue(workflowId: string, triggerData: any) {
    try {
        // Queue mein naya "Job" add karein
        const job = await workflowQueue.add("execute-workflow", {
            workflowId,
            triggerData,
            timestamp: new Date()
        }, {
            // Kuch professional settings:
            removeOnComplete: true, // Kaam khatam toh memory saaf
            attempts: 3,            // Agar fail ho jaye toh 3 baar koshish karo
            backoff: {
                type: 'exponential',
                delay: 1000,        // Har nakam koshish ke baad thoda ruk kar try karo
            }
        });

        console.log(`📦 Job queued successfully! Job ID: ${job.id}`);
    } catch (error) {
        console.error("❌ Error adding job to queue:", error);
    }
}