import Button from "../../../../ui/Button";
import { Workflow } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import { SectionLabel, CreateTrigger } from "./styles";
import { AddWorkflowModal } from "./AddWorkflowModal";
import { useNavigationList } from "@pages/Agents/components/NavigationList/hooks/useNavigationList";
import ListBox from "@ui/ListBox";
import { ChildIndicator } from "@pages/Agents/components/NavigationList/styles";
import { useStore } from "../../../../../../main/store/hooks/useStore";
import { useCallback } from "react";
import Breadcrumbs from "@ui/Breadcrumbs";
import { EditWorkflowPopover } from "./EditWorkflowPopover";
import { EditSessionPopover } from "./EditSessionPopover";
import { v4 as uuid } from "uuid";

export const WorkflowList = ({
  onSelect,
  onDelete,
  onCreate,
}: {
  onSelect?: (name: string) => void;
  onDelete: (key: string) => void;
  onCreate: (name: string) => void;
}) => {
  const [store, set] = useStore();
  const workflows = store.workflows as Workflow[];
  const sessions = store.sessions;
  const selectedSession = (store as any).selectedSession as string | number | null;

  const {
    crumbs,
    path,
    onPathClick,
    node: currentNode,
    onNodeClick,
    options,
  } = useNavigationList(
    {
      id: "root",
      label: "Workflows",
      options: [
        ...workflows.map((workflow) => {
          const { id, name } = workflow;
          return {
            ...workflow,
            label: name,
            type: "workflow",
            options: [
              ...sessions
                .filter((session) => session?.workflow?.id === id)
                .map((session) => {
                  return { ...session, label: session.name, type: "session" };
                }),
            ],
          };
        }),
      ],
    },
    "",
  );

  const onSelectSession = useCallback(
    (id: string | number) => {
      set((store) => ({ ...store, selectedSession: id }));
    },
    [set],
  );

  const handleCreateSession = useCallback(() => {
    if (!currentNode || (currentNode as any).type !== "workflow") return;
    const workflowId = (currentNode as any).id;
    set((store) => ({
      ...store,
      sessions: [
        ...(store.sessions as any[]),
        {
          id: uuid(),
          workflow: { id: workflowId },
          agent: { id: null },
          name: "New Session",
          messages: [],
          startedAt: new Date().toISOString(),
        },
      ],
    }));
  }, [set, currentNode]);

  const onDuplicate = useCallback(
    (workflow: Workflow) => {
      set((store) => ({
        ...store,
        workflows: [
          ...(store.workflows as Workflow[]),
          { ...workflow, name: `${workflow.name} (copy)` },
        ],
      }));
    },
    [set],
  );

  return (
    <CollapsiblePanel label="Workflows" width={230} background="#fff">
      <div
        style={{
          padding: "0 12px",
        }}
      >
        <Breadcrumbs
          items={crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return {
              label: crumb.label,
              onClick: isLast ? undefined : () => onPathClick(crumb),
            };
          })}
        />
      </div>
      <CreateTrigger>
        {(currentNode as any)?.type === "workflow" ? (
          <Button
            variant="outline"
            size="sm"
            style={{ width: "100%" }}
            onClick={handleCreateSession}
          >
            + New Session
          </Button>
        ) : (
          <AddWorkflowModal
            trigger={
              <Button variant="outline" size="sm" style={{ width: "100%" }}>
                + Create Workflow
              </Button>
            }
            onCreate={onCreate}
          />
        )}
      </CreateTrigger>

      <ListBox
        aria-label={currentNode?.label}
        onAction={(option) => {
          const opt = option as any;

          if (opt.type === "session") {
            onSelectSession(opt.id);
            return;
          }

          if (opt.type === "workflow") {
            const workflowSession = (sessions as any[]).find(
              (s: any) => s?.workflow?.id === opt.id,
            );
            if (workflowSession) onSelectSession(workflowSession.id);
            onSelect?.(opt.label as string);
          }
          onNodeClick(opt.id);
        }}
      >
        {options.map((option) => {
          const hasChildren = (option.options?.length ?? 0) > 0;
          return (
            <ListBox.Item
              key={option.id}
              item={option}
              selected={option.type === "session" && option.id === selectedSession}
            >
              <div
                style={{
                  flex: "1 1 0%",
                  minWidth: "0px",
                }}
              >
                <div>{option.label}</div>
                {option.description && <div>{option.description}</div>}
              </div>

              {option.type === "workflow" && (
                <EditWorkflowPopover
                  workflow={workflows.find((w) => w.name === option.label)!}
                  onDuplicate={onDuplicate}
                  onDelete={(w) => onDelete(w.name)}
                />
              )}
              {option.type === "session" && (
                <EditSessionPopover
                  session={option as any}
                  onEdit={(s, name) => {
                    set((store) => ({
                      ...store,
                      sessions: (store.sessions as any[]).map((sess) =>
                        sess.id === s.id ? { ...sess, name } : sess,
                      ),
                    }));
                  }}
                  onDelete={(s) => {
                    set((store) => ({
                      ...store,
                      sessions: (store.sessions as any[]).filter(
                        (sess) => sess.id !== s.id,
                      ),
                    }));
                  }}
                />
              )}
              {hasChildren && <ChildIndicator>›</ChildIndicator>}
            </ListBox.Item>
          );
        })}
      </ListBox>
    </CollapsiblePanel>
  );
};
