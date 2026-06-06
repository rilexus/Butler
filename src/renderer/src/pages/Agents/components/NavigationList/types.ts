export type NavigationNode = {
  id: string;
  label: string;
  type?: string;
  options?: NavigationNode[];
};

export type NavigationListProps = {
  node: NavigationNode;
  path?: string;
};
