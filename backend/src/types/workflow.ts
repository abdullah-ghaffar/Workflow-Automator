export type NodeType = 'input' | 'default' | 'TRIGGER_WEBHOOK' | 'ACTION_SEND_EMAIL' | 'ACTION_GENERATE_BILL' | 'ACTION_DELAY';

export interface WorkflowNode {
    id: string;
    type: NodeType;
    data: {
        label: string;
        actionType?: string;
        email?: string;
        amount?: number;
        delay?: number; // Seconds mein wait karne ke liye
        [key: string]: any;
    };
    position: { x: number; y: number };
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}

export interface Workflow {
    id: string;
    name: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}