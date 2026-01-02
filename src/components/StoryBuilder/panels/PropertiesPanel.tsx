import { useCallback, useMemo, useState } from 'react';
import { Play, X, Plus, ChevronDown, ChevronRight, Eye, Zap, Variable } from 'lucide-react';
import { useStoryBuilderContext, type PassageNodeData, type EndingNodeData, type StateNodeData, type ConditionNodeData, type BuilderChoice, type StartNodeData, type StateVariable } from '../../../context/StoryBuilderContext';
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
          <StartNodeEditor 
            nodeId={selectedNode.id} 
            data={selectedNode.data as StartNodeData}
            updateData={(data) => updateNodeData(selectedNode.id, data)}
          />
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

interface StartNodeEditorProps {
  nodeId: string;
  data: StartNodeData;
  updateData: (data: Partial<StartNodeData>) => void;
}

function StartNodeEditor({ nodeId, data, updateData }: StartNodeEditorProps) {
  const initialState = data.initialState || [];
  
  const handleAddVariable = useCallback(() => {
    updateData({ 
      initialState: [...initialState, { key: '', value: '' }] 
    });
  }, [initialState, updateData]);
  
  const handleUpdateVariable = useCallback((index: number, updates: Partial<StateVariable>) => {
    const newState = [...initialState];
    newState[index] = { ...newState[index], ...updates };
    updateData({ initialState: newState });
  }, [initialState, updateData]);
  
  const handleDeleteVariable = useCallback((index: number) => {
    updateData({ initialState: initialState.filter((_, i) => i !== index) });
  }, [initialState, updateData]);
  
  const parseValue = (valueStr: string): string | number | boolean => {
    if (valueStr === 'true') return true;
    if (valueStr === 'false') return false;
    if (!isNaN(Number(valueStr)) && valueStr !== '') return Number(valueStr);
    return valueStr;
  };
  
  return (
    <>
      <div className={styles.startNodeIntro}>
        <div className={styles.emptyPanelIcon}>
          <Play size={24} />
        </div>
        <p className={styles.emptyPanelText}>
          This is where your story begins. Connect it to your first passage.
        </p>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          <Variable size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Initial State Variables
        </label>
        <p className={styles.choiceOptionHint} style={{ marginBottom: 'var(--space-2)' }}>
          Define variables that track story progress (e.g., hasKey, trustLevel)
        </p>
        
        <div className={styles.stateList}>
          {initialState.map((variable, index) => (
            <div key={index} className={styles.stateItem}>
              <input
                type="text"
                className={styles.stateKeyInput}
                value={variable.key}
                onChange={(e) => handleUpdateVariable(index, { key: e.target.value })}
                placeholder="variable name"
              />
              <span className={styles.stateEquals}>=</span>
              <input
                type="text"
                className={styles.stateValueInput}
                value={String(variable.value)}
                onChange={(e) => handleUpdateVariable(index, { value: parseValue(e.target.value) })}
                placeholder="initial value"
              />
              <button
                className={styles.choiceDeleteButton}
                onClick={() => handleDeleteVariable(index)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <button className={styles.addChoiceButton} onClick={handleAddVariable}>
          <Plus size={14} />
          Add Variable
        </button>
      </div>
      
      <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-4)', color: 'var(--color-text-subtle)' }}>
        Node ID: {nodeId}
      </p>
    </>
  );
}

interface PassageNodeEditorProps {
  nodeId: string;
  data: PassageNodeData;
  updateData: (data: Partial<PassageNodeData>) => void;
}

function PassageNodeEditor({ data, updateData }: PassageNodeEditorProps) {
  const [expandedChoices, setExpandedChoices] = useState<Set<string>>(new Set());
  
  const handlePassageIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    updateData({ passageId: value });
  }, [updateData]);
  
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateData({ text: e.target.value });
  }, [updateData]);
  
  const handleChoiceUpdate = useCallback((choiceId: string, updates: Partial<BuilderChoice>) => {
    const newChoices = data.choices.map(c => 
      c.id === choiceId ? { ...c, ...updates } : c
    );
    updateData({ choices: newChoices });
  }, [data.choices, updateData]);
  
  const handleAddChoice = useCallback(() => {
    const newChoice: BuilderChoice = { id: `choice-${Date.now()}`, text: '' };
    updateData({ choices: [...data.choices, newChoice] });
  }, [data.choices, updateData]);
  
  const handleDeleteChoice = useCallback((choiceId: string) => {
    updateData({ choices: data.choices.filter(c => c.id !== choiceId) });
    setExpandedChoices(prev => {
      const next = new Set(prev);
      next.delete(choiceId);
      return next;
    });
  }, [data.choices, updateData]);
  
  const toggleExpanded = useCallback((choiceId: string) => {
    setExpandedChoices(prev => {
      const next = new Set(prev);
      if (next.has(choiceId)) {
        next.delete(choiceId);
      } else {
        next.add(choiceId);
      }
      return next;
    });
  }, []);
  
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
            <ChoiceEditor
              key={choice.id}
              choice={choice}
              index={index}
              isExpanded={expandedChoices.has(choice.id)}
              onToggleExpand={() => toggleExpanded(choice.id)}
              onUpdate={(updates) => handleChoiceUpdate(choice.id, updates)}
              onDelete={() => handleDeleteChoice(choice.id)}
              canDelete={data.choices.length > 1}
            />
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

interface ChoiceEditorProps {
  choice: BuilderChoice;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<BuilderChoice>) => void;
  onDelete: () => void;
  canDelete: boolean;
}

function ChoiceEditor({ choice, index, isExpanded, onToggleExpand, onUpdate, onDelete, canDelete }: ChoiceEditorProps) {
  const hasCondition = !!choice.condition?.key;
  const hasSetState = !!choice.setState?.key;
  
  const handleConditionKeyChange = (key: string) => {
    if (!key) {
      onUpdate({ condition: undefined });
    } else {
      onUpdate({ condition: { key, value: choice.condition?.value ?? true } });
    }
  };
  
  const handleConditionValueChange = (valueStr: string) => {
    let value: string | number | boolean = valueStr;
    if (valueStr === 'true') value = true;
    else if (valueStr === 'false') value = false;
    else if (!isNaN(Number(valueStr)) && valueStr !== '') value = Number(valueStr);
    
    onUpdate({ condition: { key: choice.condition?.key || '', value } });
  };
  
  const handleSetStateKeyChange = (key: string) => {
    if (!key) {
      onUpdate({ setState: undefined });
    } else {
      onUpdate({ setState: { key, value: choice.setState?.value ?? true } });
    }
  };
  
  const handleSetStateValueChange = (valueStr: string) => {
    let value: string | number | boolean = valueStr;
    if (valueStr === 'true') value = true;
    else if (valueStr === 'false') value = false;
    else if (!isNaN(Number(valueStr)) && valueStr !== '') value = Number(valueStr);
    
    onUpdate({ setState: { key: choice.setState?.key || '', value } });
  };
  
  return (
    <div className={styles.choiceItemExpanded}>
      <div className={styles.choiceItemHeader}>
        <button 
          className={styles.choiceExpandButton}
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse options" : "Expand options"}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className={styles.choiceNumber}>{index + 1}</span>
        <input
          type="text"
          className={styles.choiceInput}
          value={choice.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Choice text..."
        />
        {hasCondition && (
          <span className={styles.choiceBadge} title="Has show condition">
            <Eye size={10} />
          </span>
        )}
        {hasSetState && (
          <span className={styles.choiceBadge} title="Sets state">
            <Zap size={10} />
          </span>
        )}
        <button
          className={styles.choiceDeleteButton}
          onClick={onDelete}
          disabled={!canDelete}
        >
          <X size={14} />
        </button>
      </div>
      
      {isExpanded && (
        <div className={styles.choiceOptions}>
          <div className={styles.choiceOption}>
            <div className={styles.choiceOptionLabel}>
              <Eye size={12} />
              <span>Show only if</span>
            </div>
            <div className={styles.choiceOptionInputs}>
              <input
                type="text"
                className={styles.choiceOptionInput}
                value={choice.condition?.key || ''}
                onChange={(e) => handleConditionKeyChange(e.target.value)}
                placeholder="variable name"
              />
              <span className={styles.choiceOptionEquals}>=</span>
              <input
                type="text"
                className={styles.choiceOptionInput}
                value={choice.condition?.key ? String(choice.condition.value) : ''}
                onChange={(e) => handleConditionValueChange(e.target.value)}
                placeholder="value"
                disabled={!choice.condition?.key}
              />
            </div>
            <p className={styles.choiceOptionHint}>
              Leave empty to always show this choice
            </p>
          </div>
          
          <div className={styles.choiceOption}>
            <div className={styles.choiceOptionLabel}>
              <Zap size={12} />
              <span>When chosen, set</span>
            </div>
            <div className={styles.choiceOptionInputs}>
              <input
                type="text"
                className={styles.choiceOptionInput}
                value={choice.setState?.key || ''}
                onChange={(e) => handleSetStateKeyChange(e.target.value)}
                placeholder="variable name"
              />
              <span className={styles.choiceOptionEquals}>=</span>
              <input
                type="text"
                className={styles.choiceOptionInput}
                value={choice.setState?.key ? String(choice.setState.value) : ''}
                onChange={(e) => handleSetStateValueChange(e.target.value)}
                placeholder="value"
                disabled={!choice.setState?.key}
              />
            </div>
            <p className={styles.choiceOptionHint}>
              Leave empty if no state change needed
            </p>
          </div>
        </div>
      )}
    </div>
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

