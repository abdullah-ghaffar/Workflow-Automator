import { Worker, Job } from "bullmq";
import { workflows } from "../data/workflowStore";
import { WorkflowNode } from "../types/workflow";

const connection = { host: "127.0.0.1", port: 6379 };

const replaceVariables = (text: string, data: any) => {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/{{(\w+)}}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
};

const worker = new Worker("workflow-queue", async (job: Job) => {
    const { workflowId, triggerData } = job.data;
    const workflow = workflows.find(wf => wf.id === workflowId);

    if (!workflow) {
        console.log(`❌ Error: Workflow ${workflowId} not found!`);
        return;
    }

    console.log(`\n🚀 STARTING WORKFLOW: "${workflow.name}"`);

    let currentNode: WorkflowNode | undefined = workflow.nodes.find(n => n.type === 'input');

    while (currentNode) {
        const displayLabel = replaceVariables(currentNode.data.label, triggerData);
        console.log(`🎬 Current Step: [${displayLabel}]`);

        // --- ACTION LOGICS ---
        
        // 1. Email Action
        if (currentNode.data.actionType === 'ACTION_SEND_EMAIL') {
            const finalEmail = replaceVariables(currentNode.data.email || '', triggerData);
            console.log(`📧 ACTION: Sending Email to 👉 ${finalEmail}`);
        }

        // 2. Bill Action
        if (currentNode.data.actionType === 'ACTION_GENERATE_BILL') {
            console.log(`💰 ACTION: Generating Bill of 👉 $${currentNode.data.amount}`);
        }

        // 3. 🔥 DELAY ACTION (The New Logic)
        if (currentNode.data.actionType === 'ACTION_DELAY') {
            const waitTime = currentNode.data.delay || 0;
            console.log(`⏳ ACTION: Waiting for ${waitTime} seconds...`);
            await new Promise(r => setTimeout(r, waitTime * 1000));
            console.log(`⏰ Wait over. Proceeding to next step.`);
        }

        // --- FIND NEXT STEP ---
        const edge = workflow.edges.find(e => e.source === currentNode?.id);
        if (edge) {
            currentNode = workflow.nodes.find(n => n.id === edge.target);
            // Default 1 sec gap between steps
            await new Promise(r => setTimeout(r, 1000));
        } else {
            currentNode = undefined;
        }
    }

    console.log(`✨ DONE: Workflow Completed.\n`);

}, { connection });

console.log("🚀 Smart Worker with Delay Support is Online!");