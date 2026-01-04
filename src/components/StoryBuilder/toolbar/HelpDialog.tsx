import { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Play, 
  Flag, 
  ArrowRight,
  MousePointer,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Layers,
  ClipboardList,
  LayoutGrid,
  PenTool,
  Link2,
  FlaskConical,
  Sparkles,
  Pencil,
  Gamepad2,
  Zap,
  Bug,
  Check,
  XIcon,
  Circle
} from 'lucide-react';
import styles from './HelpDialog.module.css';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Section = 'overview' | 'nodes' | 'connections' | 'workflow' | 'tips';

export function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <BookOpen size={20} />
            <h2>Story Builder Guide</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <nav className={styles.sidebar}>
            <button 
              className={`${styles.navItem} ${activeSection === 'overview' ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <BookOpen size={16} />
              Getting Started
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'nodes' ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection('nodes')}
            >
              <Layers size={16} />
              Node Types
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'connections' ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection('connections')}
            >
              <ArrowRight size={16} />
              Connections
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'workflow' ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection('workflow')}
            >
              <MousePointer size={16} />
              Workflow
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'tips' ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection('tips')}
            >
              <Lightbulb size={16} />
              Tips & Tricks
            </button>
          </nav>

          <div className={styles.main}>
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'nodes' && <NodesSection />}
            {activeSection === 'connections' && <ConnectionsSection />}
            {activeSection === 'workflow' && <WorkflowSection />}
            {activeSection === 'tips' && <TipsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Welcome to the Story Builder</h3>
      <p className={styles.intro}>
        Create interactive choose-your-own-adventure stories using a visual node-based editor. 
        Connect story passages together to build branching narratives where readers make choices 
        that affect the outcome.
      </p>

      <div className={styles.quickStart}>
        <h4>Quick Start</h4>
        <ol className={styles.steps}>
          <li>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Add a Start Node</strong>
              <p>Click the green "Start" button at the bottom of the canvas to add your story's beginning.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Create Passages</strong>
              <p>Add Passage nodes for each scene in your story. Click on a node to edit its text and choices.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Connect Nodes</strong>
              <p>Drag from a node's output handle (right side) to another node's input handle (left side) to create story paths.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Add Endings</strong>
              <p>Create Ending nodes for your story conclusions. Mark them as good, bad, or neutral outcomes.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Test & Export</strong>
              <p>Use the Test button to play through your story, then Export to save it.</p>
            </div>
          </li>
        </ol>
      </div>

      <div className={styles.conceptBox}>
        <h4>Understanding the Canvas</h4>
        <ul>
          <li><strong>Pan:</strong> Click and drag on empty space, or use middle mouse button</li>
          <li><strong>Zoom:</strong> Pinch to zoom, or use your trackpad</li>
          <li><strong>Select:</strong> Click a node to select it and edit in the Properties Panel</li>
          <li><strong>Multi-select:</strong> Click and drag to select multiple nodes</li>
          <li><strong>Delete:</strong> Select nodes and press Backspace or Delete</li>
        </ul>
      </div>
    </div>
  );
}

function NodesSection() {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Node Types</h3>
      <p className={styles.intro}>
        Each node type serves a specific purpose in your story. Combine them to create 
        rich, branching narratives.
      </p>

      <div className={styles.nodeTypes}>
        <div className={styles.nodeType}>
          <div className={`${styles.nodeIcon} ${styles.nodeIconStart}`}>
            <Play size={20} />
          </div>
          <div className={styles.nodeInfo}>
            <h4>Start Node</h4>
            <p>
              Every story needs exactly one Start node. This is where your adventure begins. 
              It contains the opening text that readers see first.
            </p>
            <div className={styles.nodeExample}>
              <strong>Example:</strong> "You wake up in a dimly lit room. The door creaks open..."
            </div>
          </div>
        </div>

        <div className={styles.nodeType}>
          <div className={`${styles.nodeIcon} ${styles.nodeIconPassage}`}>
            <BookOpen size={20} />
          </div>
          <div className={styles.nodeInfo}>
            <h4>Passage Node</h4>
            <p>
              The main building block of your story. Passages contain narrative text and 
              present choices to the reader. Each choice can lead to a different passage 
              or ending.
            </p>
            <div className={styles.nodeExample}>
              <strong>Example:</strong> "The forest path splits in two. To the left, you hear 
              running water. To the right, smoke rises between the trees."
            </div>
            <div className={styles.nodeFeatures}>
              <span><CheckCircle size={12} /> Multiple choices</span>
              <span><CheckCircle size={12} /> Branching paths</span>
            </div>
          </div>
        </div>

        <div className={styles.nodeType}>
          <div className={`${styles.nodeIcon} ${styles.nodeIconEnding}`}>
            <Flag size={20} />
          </div>
          <div className={styles.nodeInfo}>
            <h4>Ending Node</h4>
            <p>
              Endings conclude your story. Mark them as <strong>Good</strong>, <strong>Bad</strong>, 
              or <strong>Neutral</strong> to indicate the outcome type. Stories should have 
              at least one ending.
            </p>
            <div className={styles.endingTypes}>
              <span className={styles.endingGood}><Check size={12} /> Good Ending</span>
              <span className={styles.endingBad}><XIcon size={12} /> Bad Ending</span>
              <span className={styles.endingNeutral}><Circle size={12} /> Neutral Ending</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ConnectionsSection() {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Making Connections</h3>
      <p className={styles.intro}>
        Connections define how your story flows from one passage to the next. 
        Every choice leads somewhere.
      </p>

      <div className={styles.connectionGuide}>
        <h4>How to Connect Nodes</h4>
        
        <div className={styles.connectionMethod}>
          <div className={styles.methodNumber}>1</div>
          <div className={styles.methodContent}>
            <strong>Drag to Existing Node</strong>
            <p>
              Click and drag from the circular handle on the right side of a node 
              to the handle on the left side of another node.
            </p>
          </div>
        </div>

        <div className={styles.connectionMethod}>
          <div className={styles.methodNumber}>2</div>
          <div className={styles.methodContent}>
            <strong>Drag to Empty Space</strong>
            <p>
              Drag from a handle and release on empty canvas space. A menu will appear 
              letting you create a new connected node instantly.
            </p>
          </div>
        </div>

        <div className={styles.connectionMethod}>
          <div className={styles.methodNumber}>3</div>
          <div className={styles.methodContent}>
            <strong>Choice-Specific Connections</strong>
            <p>
              Passage nodes with multiple choices have individual handles for each choice. 
              Connect each choice to its destination separately.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.connectionRules}>
        <h4>Connection Rules</h4>
        <ul>
          <li>
            <ChevronRight size={14} />
            <span>Connections flow left-to-right (input on left, output on right)</span>
          </li>
          <li>
            <ChevronRight size={14} />
            <span>Start nodes can only have outputs (they're always first)</span>
          </li>
          <li>
            <ChevronRight size={14} />
            <span>Ending nodes can only have inputs (they're always last)</span>
          </li>
          <li>
            <ChevronRight size={14} />
            <span>Each choice can only connect to one destination</span>
          </li>
          <li>
            <ChevronRight size={14} />
            <span>A node can receive connections from multiple sources</span>
          </li>
        </ul>
      </div>

      <div className={styles.warningBox}>
        <AlertTriangle size={16} />
        <div>
          <strong>Watch for Orphaned Nodes</strong>
          <p>
            The validator will warn you about nodes that aren't connected to the story flow. 
            Every node should be reachable from the Start node.
          </p>
        </div>
      </div>
    </div>
  );
}

function WorkflowSection() {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Building Workflow</h3>
      <p className={styles.intro}>
        Follow this workflow to create well-structured, engaging stories.
      </p>

      <div className={styles.workflowSteps}>
        <div className={styles.workflowStep}>
          <div className={styles.workflowIcon}><ClipboardList size={20} /></div>
          <div className={styles.workflowContent}>
            <h4>1. Plan Your Story</h4>
            <p>
              Before diving in, sketch out your story's main branches. Think about:
            </p>
            <ul>
              <li>What's the central conflict or goal?</li>
              <li>What are the major decision points?</li>
              <li>How many endings do you want?</li>
              <li>What makes each ending feel earned?</li>
            </ul>
          </div>
        </div>

        <div className={styles.workflowStep}>
          <div className={styles.workflowIcon}><LayoutGrid size={20} /></div>
          <div className={styles.workflowContent}>
            <h4>2. Build the Skeleton</h4>
            <p>
              Create your nodes first, adding just titles or brief notes. 
              Connect them to visualize the story structure before writing full text.
            </p>
          </div>
        </div>

        <div className={styles.workflowStep}>
          <div className={styles.workflowIcon}><PenTool size={20} /></div>
          <div className={styles.workflowContent}>
            <h4>3. Write the Content</h4>
            <p>
              Click each node to select it, then use the Properties Panel on the right 
              to write passage text and define choices. Keep passages focused—one scene 
              or decision per node.
            </p>
          </div>
        </div>

        <div className={styles.workflowStep}>
          <div className={styles.workflowIcon}><Link2 size={20} /></div>
          <div className={styles.workflowContent}>
            <h4>4. Wire Up Choices</h4>
            <p>
              Connect each choice to its destination. Each choice should lead to 
              another passage or an ending to create your branching narrative.
            </p>
          </div>
        </div>

        <div className={styles.workflowStep}>
          <div className={styles.workflowIcon}><FlaskConical size={20} /></div>
          <div className={styles.workflowContent}>
            <h4>5. Test Thoroughly</h4>
            <p>
              Use the Test button to play through your story. Try every path! 
              Check for dead ends, logic errors, and pacing issues.
            </p>
          </div>
        </div>

        <div className={styles.workflowStep}>
          <div className={styles.workflowIcon}><Sparkles size={20} /></div>
          <div className={styles.workflowContent}>
            <h4>6. Polish & Export</h4>
            <p>
              Review the validation panel for any warnings. Add metadata (title, author, 
              description), then export your finished story.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.propertiesGuide}>
        <h4>Using the Properties Panel</h4>
        <p>
          When you select a node, the Properties Panel on the right shows all editable fields:
        </p>
        <ul>
          <li><strong>Passage ID:</strong> Unique identifier (auto-generated, but customizable)</li>
          <li><strong>Text:</strong> The narrative content readers will see</li>
          <li><strong>Choices:</strong> Options presented to the reader (for Passage nodes)</li>
          <li><strong>Ending Type:</strong> Good/Bad/Neutral (for Ending nodes)</li>
        </ul>
      </div>
    </div>
  );
}

function TipsSection() {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Tips & Best Practices</h3>

      <div className={styles.tipCategories}>
        <div className={styles.tipCategory}>
          <h4><Pencil size={16} /> Writing Tips</h4>
          <ul className={styles.tipList}>
            <li>
              <strong>Keep passages focused.</strong> One scene, one decision. 
              Long passages lose readers.
            </li>
            <li>
              <strong>Make choices meaningful.</strong> Each option should feel 
              distinct and have real consequences.
            </li>
            <li>
              <strong>Show, don't tell.</strong> Use descriptive language to 
              immerse readers in the story.
            </li>
            <li>
              <strong>Vary your endings.</strong> Include multiple outcomes 
              to reward exploration.
            </li>
            <li>
              <strong>Avoid dead ends.</strong> Even bad endings should feel 
              like a conclusion, not an error.
            </li>
          </ul>
        </div>

        <div className={styles.tipCategory}>
          <h4><Gamepad2 size={16} /> Design Tips</h4>
          <ul className={styles.tipList}>
            <li>
              <strong>2-4 choices is ideal.</strong> Too many overwhelms readers; 
              too few feels linear.
            </li>
            <li>
              <strong>Create meaningful branches.</strong> Converging paths are fine, 
              but key decisions should lead to different experiences.
            </li>
            <li>
              <strong>Keep it focused.</strong> Each passage should have a clear 
              purpose and advance the story.
            </li>
            <li>
              <strong>Balance branch depth.</strong> Don't let one path have 20 
              passages while another has 3.
            </li>
          </ul>
        </div>

        <div className={styles.tipCategory}>
          <h4><Zap size={16} /> Efficiency Tips</h4>
          <ul className={styles.tipList}>
            <li>
              <strong>Drag to empty space</strong> to quickly create connected nodes.
            </li>
            <li>
              <strong>Use the minimap</strong> (bottom-right) to navigate large stories.
            </li>
            <li>
              <strong>Your work auto-saves</strong> to browser storage. Recover it 
              if you accidentally close the tab.
            </li>
            <li>
              <strong>Export regularly</strong> to back up your work as a file.
            </li>
            <li>
              <strong>Drop a .json file</strong> onto the canvas to import a story.
            </li>
          </ul>
        </div>

        <div className={styles.tipCategory}>
          <h4><Bug size={16} /> Troubleshooting</h4>
          <ul className={styles.tipList}>
            <li>
              <strong>Red validation errors</strong> must be fixed before exporting. 
              Hover over the indicator to see details.
            </li>
            <li>
              <strong>Yellow warnings</strong> are suggestions. The story will work, 
              but something might be off.
            </li>
            <li>
              <strong>"Orphaned passage"</strong> means a node isn't reachable from Start. 
              Connect it or delete it.
            </li>
            <li>
              <strong>"Choice has no target"</strong> means a choice isn't connected. 
              Wire it to a destination node.
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.exampleStory}>
        <h4>Example: Simple Story Structure</h4>
        <div className={styles.storyDiagram}>
          <div className={styles.diagramRow}>
            <span className={styles.diagramNode + ' ' + styles.diagramStart}>Start</span>
            <span className={styles.diagramArrow}>→</span>
            <span className={styles.diagramNode + ' ' + styles.diagramPassage}>Forest Path</span>
          </div>
          <div className={styles.diagramBranch}>
            <div className={styles.diagramPath}>
              <span className={styles.diagramChoice}>"Go left"</span>
              <span className={styles.diagramArrow}>→</span>
              <span className={styles.diagramNode + ' ' + styles.diagramPassage}>River</span>
              <span className={styles.diagramArrow}>→</span>
              <span className={styles.diagramNode + ' ' + styles.diagramEnding}>Good End</span>
            </div>
            <div className={styles.diagramPath}>
              <span className={styles.diagramChoice}>"Go right"</span>
              <span className={styles.diagramArrow}>→</span>
              <span className={styles.diagramNode + ' ' + styles.diagramPassage}>Cave</span>
              <span className={styles.diagramArrow}>→</span>
              <span className={styles.diagramNode + ' ' + styles.diagramEnding}>Bad End</span>
            </div>
          </div>
        </div>
        <p className={styles.diagramCaption}>
          A minimal story: Start → Decision → Two possible endings
        </p>
      </div>
    </div>
  );
}

