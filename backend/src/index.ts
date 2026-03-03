import cors from "cors";
import express, { Request, Response } from "express";
import { workflows } from "./data/workflowStore";
import { addJobToQueue } from "./queue/workflow.queue";

const app = express();
app.use(cors());
app.use(express.json());

// 1. Save Workflow (Frontend se design receive karein)
app.post("/workflows", (req: Request, res: Response) => {
    const incomingWorkflow = req.body;
    console.log(`📥 Received Workflow: ${incomingWorkflow.name}`);

    const index = workflows.findIndex(w => w.id === incomingWorkflow.id);
    if (index !== -1) {
        workflows[index] = incomingWorkflow;
    } else {
        workflows.push(incomingWorkflow);
    }
    res.json({ message: "Workflow saved successfully!" });
});

// 2. Webhook Receiver (Trigger with Dynamic Data)
app.post("/hooks/catch/:webhookId", async (req: Request, res: Response) => {
    const { webhookId } = req.params;
    
    // UI se save kiya hua workflow dhoondo
    const workflow = workflows.find(wf => wf.id === "flow_custom"); 

    if (workflow) {
        console.log(`📨 Webhook Triggered for: ${workflow.name}`);
        
        // 🔥 ASLI TABDEELI: req.body (Webhook ka sara data) Redis mein bhej rahe hain
        await addJobToQueue(workflow.id, req.body); 
        
        res.json({ 
            message: "Workflow Queued!", 
            dataReceived: req.body 
        });
    } else {
        res.status(404).json({ error: "No workflow found. Please save design from UI first." });
    }
});

app.listen(3000, () => {
    console.log("⚡ API Server Running on http://localhost:3000");
});

// Worker ko yahin shamil karein taaki memory share ho sake
import "./workers/workflow.worker";