import { NavigationListProps } from "./types";
import {
  Root,
  BreadcrumbsContainer,
  NodeHeader,
  OptionLabel,
  ChildIndicator,
  EmptyState,
} from "./styles";
import Breadcrumbs from "../../../../ui/Breadcrumbs";
import ListBox from "../../../../ui/ListBox";
import { useNavigationList } from "./hooks/useNavigationList";

const NavigationList = ({
  node,
  path = "",
  renderOption,
  onAction,
}: NavigationListProps) => {
  const {
    options,
    crumbs,
    node: currentNode,
    onNodeClick,
    onPathClick,
  } = useNavigationList(node, path);

  return (
    <Root>
      {crumbs.length > 1 && (
        <BreadcrumbsContainer>
          <Breadcrumbs
            items={crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              return {
                label: crumb.label,
                onClick: isLast ? undefined : () => onPathClick(crumb),
              };
            })}
          />
        </BreadcrumbsContainer>
      )}
      <NodeHeader>{currentNode?.label}</NodeHeader>
      {options.length === 0 ? (
        <EmptyState>No items</EmptyState>
      ) : (
        <ListBox
          aria-label={currentNode?.label}
          onAction={(option) => onNodeClick(option.id)}
        >
          {options.map((option) => {
            const hasChildren = (option.options?.length ?? 0) > 0;
            return (
              <ListBox.Item key={option.id} item={option}>
                {renderOption ? (
                  renderOption(option)
                ) : (
                  <OptionLabel>{option.label}</OptionLabel>
                )}
                {hasChildren && <ChildIndicator>›</ChildIndicator>}
              </ListBox.Item>
            );
          })}
        </ListBox>
      )}
    </Root>
  );
};

export { NavigationList };
