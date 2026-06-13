export type NavigationNode = {
  id: string;
  label: string;
  type?: string;
  description?: string;
  options?: NavigationNode[];
};

export type NavigationListProps = {
  node: NavigationNode;
  path?: string;
};
