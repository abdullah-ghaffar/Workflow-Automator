import { useCallback, useRef, useState, DragEvent, ChangeEvent, MouseEvent as ReactMouseEvent } from 'react';
import ReactFlow, { 
  Background, Controls, useNodesState, useEdgesState, addEdge,
  Connection, Edge, Node, ReactFlowProvider, ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
let id = 0;
const getId = () => `dndnode_${id++}`;

const App = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onNodeClick = (_event: ReactMouseEvent, node: Node) => setSelectedNode(node);
  const onPaneClick = () => setSelectedNode(null);

  const handleDataChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedNode) return;
    const { name, value } = event.target;
    setNodes((nds) => nds.map((node) => node.id === selectedNode.id ? { ...node, data: { ...node.data, [name]: value } } : node));
    setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, [name]: value } } : null);
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - (reactFlowBounds?.left || 0),
      y: event.clientY - (reactFlowBounds?.top || 0),
    });
    
    const newNode: Node = {
      id: getId(),
      type: type.includes('TRIGGER') ? 'input' : 'default',
      position,
      data: { label: type.replace(/_/g, ' '), actionType: type, email: '', amount: 0, delay: 5 },
      style: { borderRadius: '8px', padding: '10px', background: 'white', border: '1px solid #222', width: 180 }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const saveWorkflow = async () => {
    try {
      await fetch('http://127.0.0.1:3000/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: "flow_custom", name: "Dynamic Automation", nodes, edges })
      });
      alert("✅ Saved Successfully!");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) { alert("❌ Save Error"); }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <ReactFlowProvider>
        {/* LEFT SIDEBAR */}
        <aside style={{ width: 250, padding: 15, borderRight: '1px solid #eee', background: '#fcfcfc' }}>
          <h3>📦 Nodes Library</h3>
          <div onDragStart={(e) => onDragStart(e, 'TRIGGER_WEBHOOK')} draggable style={{ cursor: 'grab', border: '1px solid #0041d0', padding: 10, marginBottom: 10 }}>📥 Webhook</div>
          <div onDragStart={(e) => onDragStart(e, 'ACTION_SEND_EMAIL')} draggable style={{ cursor: 'grab', border: '1px solid #52C41A', padding: 10, marginBottom: 10 }}>📧 Email</div>
          <div onDragStart={(e) => onDragStart(e, 'ACTION_DELAY')} draggable style={{ cursor: 'grab', border: '1px solid #faad14', padding: 10, marginBottom: 10 }}>⏳ Delay</div>
          <div onDragStart={(e) => onDragStart(e, 'ACTION_GENERATE_BILL')} draggable style={{ cursor: 'grab', border: '1px solid #f5222d', padding: 10, marginBottom: 20 }}>💰 Bill</div>
          <button onClick={saveWorkflow} style={{ width: '100%', padding: 10, background: '#3366FF', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>💾 Save Workflow</button>
        </aside>

        {/* CENTER */}
        <div ref={reactFlowWrapper} style={{ flexGrow: 1 }}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onInit={setReactFlowInstance}
            onDrop={onDrop} onDragOver={onDragOver}
            onNodeClick={onNodeClick} onPaneClick={onPaneClick}
            fitView
          ><Background /><Controls /></ReactFlow>
        </div>

        {/* RIGHT SETTINGS PANEL */}
        {selectedNode && (
          <aside style={{ width: 300, padding: 20, borderLeft: '1px solid #ddd' }}>
            <h3>⚙️ Settings</h3>
            <label>Node ID: {selectedNode.id}</label><br /><br />
            <label>Label:</label>
            <input name="label" value={selectedNode.data.label || ''} onChange={handleDataChange} style={{ width: '100%', marginBottom: 10 }} />

            {selectedNode.data.actionType === 'ACTION_SEND_EMAIL' && (
              <><label>Email:</label><input name="email" value={selectedNode.data.email || ''} onChange={handleDataChange} style={{ width: '100%', marginBottom: 10 }} /></>
            )}

            {selectedNode.data.actionType === 'ACTION_DELAY' && (
              <><label>Wait (Seconds):</label><input name="delay" type="number" value={selectedNode.data.delay || 0} onChange={handleDataChange} style={{ width: '100%', marginBottom: 10 }} /></>
            )}

            {selectedNode.data.actionType === 'ACTION_GENERATE_BILL' && (
              <><label>Amount ($):</label><input name="amount" type="number" value={selectedNode.data.amount || 0} onChange={handleDataChange} style={{ width: '100%', marginBottom: 10 }} /></>
            )}
          </aside>
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default App;