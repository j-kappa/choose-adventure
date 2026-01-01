import { useCallback, useMemo } from 'react';
import { Play, X, Plus } from 'lucide-react';
import { useStoryBuilderContext, type PassageNodeData, type EndingNodeData, type StateNodeData, type ConditionNodeData } from '../../../context/StoryBuilderContext';
import styles from '../StoryBuilder.module.css';

export function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeData, deleteNode, metadata, setMetadata } = useStoryBuilderContext();
  
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId);
  }, [nodes, selectedNodeId]);
  
  if (!selectedNode) {
    return (
      <>
        <div className={styles.sidePanelHeader}>
          <h3 className={styles.sidePanelTitle}>Story Details</h3>
          <p className={styles.sidePanelSubtitle}>Configure your story metadata</p>
        </div>
        <div className={styles.sidePanelContent}>
          <MetadataEditor metadata={metadata} setMetadata={setMetadata} />
        </div>
      </>
    );
  }
  
  const nodeType = selectedNode.type || 'unknown';
  const nodeLabels: Record<string, string> = {
    start: 'Start Node',
    passage: 'Passage',
    ending: 'Ending',
    state: 'Set State',
    condition: 'Condition',
  };
  
  return (
    <>
      <div className={styles.sidePanelHeader}>
        <h3 className={styles.sidePanelTitle}>{nodeLabels[nodeType] || 'Node'}</h3>
        <p className={styles.sidePanelSubtitle}>Edit node properties</p>
      </div>
      <div className={styles.sidePanelContent}>
        {nodeType === 'start' && (
          <StartNodeEditor nodeId={selectedNode.id} />
        )}
        {nodeType === 'passage' && (
          <PassageNodeEditor 
            nodeId={selectedNode.id} 
            data={selectedNode.data as PassageNodeData} 
            updateData={(data) => updateNodeData(selectedNode.id, data)}
          />
        )}
        {nodeType === 'ending' && (
          <EndingNodeEditor 
            nodeId={selectedNode.id} 
            data={selectedNode.data as EndingNodeData} 
            updateData={(data) => updateNodeData(selectedNode.id, data)}
          />
        )}
        {nodeType === 'state' && (
          <StateNodeEditor 
            nodeId={selectedNode.id} 
            data={selectedNode.data as StateNodeData} 
            updateData={(data) => updateNodeData(selectedNode.id, data)}
          />
        )}
        {nodeType === 'condition' && (
          <ConditionNodeEditor 
            nodeId={selectedNode.id} 
            data={selectedNode.data as ConditionNodeData} 
            updateData={(data) => updateNodeData(selectedNode.id, data)}
          />
        )}
        
        <button 
          className={styles.deleteNodeButton}
          onClick={() => deleteNode(selectedNode.id)}
        >
          Delete Node
        </button>
      </div>
    </>
  );
}

interface MetadataEditorProps {
  metadata: { id: string; title: string; author: string; description: string; version: string };
  setMetadata: (metadata: MetadataEditorProps['metadata']) => void;
}

function MetadataEditor({ metadata, setMetadata }: MetadataEditorProps) {
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Story ID</label>
        <input
          type="text"
          className={styles.formInput}
          value={metadata.id}
          onChange={(e) => setMetadata({ ...metadata, id: e.target.value })}
          placeholder="my-story-id"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Author</label>
        <input
          type="text"
          className={styles.formInput}
          value={metadata.author}
          onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
          placeholder="Your name"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Description</label>
        <textarea
          className={`${styles.formInput} ${styles.formTextarea}`}
          value={metadata.description}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          placeholder="A brief description of your story..."
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Version</label>
        <input
          type="text"
          className={styles.formInput}
          value={metadata.version}
          onChange={(e) => setMetadata({ ...metadata, version: e.target.value })}
          placeholder="1.0"
        />
      </div>
    </>
  );
}

function StartNodeEditor({ nodeId }: { nodeId: string }) {
  return (
    <div className={styles.emptyPanel}>
      <div className={styles.emptyPanelIcon}>
        <Play size={32} />
      </div>
      <p className={styles.emptyPanelText}>
        This is where your story begins. Connect it to your first passage.
      </p>
      <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)', color: 'var(--color-text-subtle)' }}>
        Node ID: {nodeId}
      </p>
    </div>
  );
}

interface PassageNodeEditorProps {
  nodeId: string;
  data: PassageNodeData;
  updateData: (data: Partial<PassageNodeData>) => void;
}

function PassageNodeEditor({ data, updateData }: PassageNodeEditorProps) {
  const handlePassageIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    updateData({ passageId: value });
  }, [updateData]);
  
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateData({ text: e.target.value });
  }, [updateData]);
  
  const handleChoiceTextChange = useCallback((choiceId: string, text: string) => {
    const newChoices = data.choices.map(c => 
      c.id === choiceId ? { ...c, text } : c
    );
    updateData({ choices: newChoices });
  }, [data.choices, updateData]);
  
  const handleAddChoice = useCallback(() => {
    const newChoice = { id: `choice-${Date.now()}`, text: '' };
    updateData({ choices: [...data.choices, newChoice] });
  }, [data.choices, updateData]);
  
  const handleDeleteChoice = useCallback((choiceId: string) => {
    updateData({ choices: data.choices.filter(c => c.id !== choiceId) });
  }, [data.choices, updateData]);
  
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Passage ID</label>
        <input
          type="text"
          className={styles.formInput}
          value={data.passageId}
          onChange={handlePassageIdChange}
          placeholder="passage_id"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Passage Text</label>
        <textarea
          className={`${styles.formInput} ${styles.formTextarea}`}
          value={data.text}
          onChange={handleTextChange}
          placeholder="Write your passage text here. Use double line breaks for paragraphs."
          style={{ minHeight: '150px' }}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Choices</label>
        <div className={styles.choiceList}>
          {data.choices.map((choice, index) => (
            <div key={choice.id} className={styles.choiceItem}>
              <span className={styles.choiceNumber}>{index + 1}</span>
              <input
                type="text"
                className={styles.choiceInput}
                value={choice.text}
                onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                placeholder="Choice text..."
              />
              <button
                className={styles.choiceDeleteButton}
                onClick={() => handleDeleteChoice(choice.id)}
                disabled={data.choices.length <= 1}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button className={styles.addChoiceButton} onClick={handleAddChoice}>
          <Plus size={14} />
          Add Choice
        </button>
      </div>
    </>
  );
}

interface EndingNodeEditorProps {
  nodeId: string;
  data: EndingNodeData;
  updateData: (data: Partial<EndingNodeData>) => void;
}

function EndingNodeEditor({ data, updateData }: EndingNodeEditorProps) {
  const handlePassageIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    updateData({ passageId: value });
  }, [updateData]);
  
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateData({ text: e.target.value });
  }, [updateData]);
  
  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateData({ endingType: e.target.value as 'good' | 'bad' | 'neutral' });
  }, [updateData]);
  
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Passage ID</label>
        <input
          type="text"
          className={styles.formInput}
          value={data.passageId}
          onChange={handlePassageIdChange}
          placeholder="ending_id"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Ending Type</label>
        <select
          className={`${styles.formInput} ${styles.formSelect}`}
          value={data.endingType}
          onChange={handleTypeChange}
        >
          <option value="good">Good Ending</option>
          <option value="bad">Bad Ending</option>
          <option value="neutral">Neutral Ending</option>
        </select>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Ending Text</label>
        <textarea
          className={`${styles.formInput} ${styles.formTextarea}`}
          value={data.text}
          onChange={handleTextChange}
          placeholder="Write your ending text here..."
          style={{ minHeight: '150px' }}
        />
      </div>
    </>
  );
}

interface StateNodeEditorProps {
  nodeId: string;
  data: StateNodeData;
  updateData: (data: Partial<StateNodeData>) => void;
}

function StateNodeEditor({ data, updateData }: StateNodeEditorProps) {
  const handleKeyChange = useCallback((index: number, key: string) => {
    const newChanges = [...data.stateChanges];
    newChanges[index] = { ...newChanges[index], key };
    updateData({ stateChanges: newChanges });
  }, [data.stateChanges, updateData]);
  
  const handleValueChange = useCallback((index: number, valueStr: string) => {
    const newChanges = [...data.stateChanges];
    // Try to parse as boolean or number
    let value: string | number | boolean = valueStr;
    if (valueStr === 'true') value = true;
    else if (valueStr === 'false') value = false;
    else if (!isNaN(Number(valueStr)) && valueStr !== '') value = Number(valueStr);
    
    newChanges[index] = { ...newChanges[index], value };
    updateData({ stateChanges: newChanges });
  }, [data.stateChanges, updateData]);
  
  const handleAdd = useCallback(() => {
    updateData({ stateChanges: [...data.stateChanges, { key: '', value: '' }] });
  }, [data.stateChanges, updateData]);
  
  const handleDelete = useCallback((index: number) => {
    updateData({ stateChanges: data.stateChanges.filter((_, i) => i !== index) });
  }, [data.stateChanges, updateData]);
  
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>State Changes</label>
      <div className={styles.stateList}>
        {data.stateChanges.map((change, index) => (
          <div key={index} className={styles.stateItem}>
            <input
              type="text"
              className={styles.stateKeyInput}
              value={change.key}
              onChange={(e) => handleKeyChange(index, e.target.value)}
              placeholder="key"
            />
            <span className={styles.stateEquals}>=</span>
            <input
              type="text"
              className={styles.stateValueInput}
              value={String(change.value)}
              onChange={(e) => handleValueChange(index, e.target.value)}
              placeholder="value"
            />
            <button
              className={styles.choiceDeleteButton}
              onClick={() => handleDelete(index)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button className={styles.addChoiceButton} onClick={handleAdd}>
        <Plus size={14} />
        Add State Change
      </button>
    </div>
  );
}

interface ConditionNodeEditorProps {
  nodeId: string;
  data: ConditionNodeData;
  updateData: (data: Partial<ConditionNodeData>) => void;
}

function ConditionNodeEditor({ data, updateData }: ConditionNodeEditorProps) {
  const handleKeyChange = useCallback((index: number, key: string) => {
    const newConditions = [...data.conditions];
    newConditions[index] = { ...newConditions[index], key };
    updateData({ conditions: newConditions });
  }, [data.conditions, updateData]);
  
  const handleOperatorChange = useCallback((index: number, operator: '==' | '!=' | '>' | '<' | '>=' | '<=') => {
    const newConditions = [...data.conditions];
    newConditions[index] = { ...newConditions[index], operator };
    updateData({ conditions: newConditions });
  }, [data.conditions, updateData]);
  
  const handleValueChange = useCallback((index: number, valueStr: string) => {
    const newConditions = [...data.conditions];
    let value: string | number | boolean = valueStr;
    if (valueStr === 'true') value = true;
    else if (valueStr === 'false') value = false;
    else if (!isNaN(Number(valueStr)) && valueStr !== '') value = Number(valueStr);
    
    newConditions[index] = { ...newConditions[index], value };
    updateData({ conditions: newConditions });
  }, [data.conditions, updateData]);
  
  const handleAdd = useCallback(() => {
    updateData({ conditions: [...data.conditions, { key: '', operator: '==', value: '' }] });
  }, [data.conditions, updateData]);
  
  const handleDelete = useCallback((index: number) => {
    updateData({ conditions: data.conditions.filter((_, i) => i !== index) });
  }, [data.conditions, updateData]);
  
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Conditions (all must be true)</label>
        <div className={styles.stateList}>
          {data.conditions.map((cond, index) => (
            <div key={index} className={styles.stateItem} style={{ flexWrap: 'wrap' }}>
              <input
                type="text"
                className={styles.stateKeyInput}
                value={cond.key}
                onChange={(e) => handleKeyChange(index, e.target.value)}
                placeholder="key"
              />
              <select
                className={styles.formInput}
                value={cond.operator}
                onChange={(e) => handleOperatorChange(index, e.target.value as typeof cond.operator)}
                style={{ width: '60px', padding: 'var(--space-1)' }}
              >
                <option value="==">==</option>
                <option value="!=">!=</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value=">=">&gt;=</option>
                <option value="<=">&lt;=</option>
              </select>
              <input
                type="text"
                className={styles.stateValueInput}
                value={String(cond.value)}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder="value"
                style={{ flex: 1, minWidth: '60px' }}
              />
              <button
                className={styles.choiceDeleteButton}
                onClick={() => handleDelete(index)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button className={styles.addChoiceButton} onClick={handleAdd}>
          <Plus size={14} />
          Add Condition
        </button>
      </div>
      
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginTop: 'var(--space-2)' }}>
        Connect the "True" handle to the path when conditions are met, and "False" to the alternative path.
      </p>
    </>
  );
}

