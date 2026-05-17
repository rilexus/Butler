import { useState } from "react";
import { NavigationNode } from "../../types";
import { getByPath } from "../../../../../../utils/getByPath";

type CrumbItem = { label: string; path: string };

const buildCrumbs = (root: NavigationNode, path: string): CrumbItem[] => {
  const crumbs: CrumbItem[] = [{ label: root.label, path: "" }];
  if (!path) return crumbs;

  const segments = path.split(".");
  let current: NavigationNode = root;
  let currentPath = "";

  for (let i = 0; i < segments.length; i += 2) {
    // segments come in pairs: "options", "<index>"
    const idx = Number(segments[i + 1]);
    const next = current.options?.[idx];
    if (!next) break;
    currentPath = currentPath
      ? `${currentPath}.${segments[i]}.${segments[i + 1]}`
      : `${segments[i]}.${segments[i + 1]}`;
    crumbs.push({ label: next.label, path: currentPath });
    current = next;
  }

  return crumbs;
};

export const useNavigationList = (node, path) => {
  const [currentPath, setCurrentPath] = useState(path);

  const currentNode = getByPath(node, currentPath) as NavigationNode;
  const options = currentNode?.options ?? [];
  const crumbs = buildCrumbs(node, currentPath);

  const handleOptionAction = (id: string) => {
    const index = options.findIndex((o) => o.id === id);
    if (index === -1) return;
    const next = options[index];

    const path = currentPath
      ? `${currentPath}.options.${index}`
      : `options.${index}`;

    if (!Array.isArray(next?.options)) return;

    setCurrentPath(path);
  };

  const handlePathClick = ({ path }) => {
    setCurrentPath(path);
  };

  return {
    crumbs,
    path: currentPath,
    options,
    node: currentNode,
    onPathClick: handlePathClick,
    onNodeClick: handleOptionAction,
  };
};
