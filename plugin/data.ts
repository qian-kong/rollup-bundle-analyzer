import { GetModuleInfo } from "rollup";
import { isModuleTree, ModuleLengths, ModuleTree, ModuleTreeLeaf } from "../shared/types";
import { ModuleMapper } from "./module-mapper";

const addToPath = (moduleId: string, tree: any, modulePath: string[], node: any): void => {
  if (modulePath.length === 0) {
    throw new Error(`Error adding node to path ${moduleId}`);
  }
  const [head, ...rest] = modulePath;

  if (rest.length === 0) {
    tree.groups.push({ ...node, label: head });
    return;
  } else {
    let newTree = tree.groups.find(
      (folder: any): folder is ModuleTree => folder.label === head && isModuleTree(folder)
    );

    if (!newTree) {
      newTree = {
        label: head,
        groups: [],
        gzipSize: 0,
        parsedSize: 0,
        statSize: 0,
        weight: 0,
      };
      tree.groups.push(newTree);
    }
    newTree.gzipSize += node.gzipSize || 0;
    newTree.parsedSize += node.parsedSize || 0;
    newTree.statSize += node.statSize || 0;
    newTree.weight = tree.statSize;
    addToPath(moduleId, newTree, rest, node);
    return;
  }
};
let count = 0;
// TODO try to make it without recursion, but still typesafe
const mergeSingleChildTrees = (tree: any): any => {
  if (tree.groups.length === 1) {
    const child = tree.groups[0];
    const name = `${tree.label}/${child.label}`;
    if ("groups" in child) {
      tree.label = name;
      tree.groups = child.groups;
      tree.gzipSize = child.gzipSize || 0;
      tree.parsedSize = child.parsedSize || 0;
      tree.statSize = child.statSize || 0;
      tree.weight = child.weight || 0;
      tree.cid = count++;
      return mergeSingleChildTrees(tree);
    } else {
      return {
        label: name,
        cid: child.cid,
        gzipSize: child.gzipSize || 0,
        parsedSize: child.parsedSize || 0,
        statSize: child.statSize || 0,
        weight: child.weight || 0,
        id: name,
        path: name,
      };
    }
  } else {
    tree.groups = tree.groups.map((node: any) => {
      if ("groups" in node) {
        return mergeSingleChildTrees(node);
      } else {
        return node;
      }
    });
    return tree;
  }
};

export const buildTree = (
  ob: any,
  modules: Array<ModuleLengths & { id: string }>,
  mapper: ModuleMapper
): ModuleTree => {
  const { bundleId, gzipLength, brotliLength, renderedLength } = ob;
  const tree: any = {
    label: bundleId,
    groups: [],
    gzipSize: gzipLength,
    parsedSize: brotliLength,
    statSize: renderedLength,
    isAsset: true,
    cid: count++,
    isInitialByEntrypoint: {},
  };

  for (const { id, renderedLength, gzipLength, brotliLength } of modules) {
    const bundleModuleUid = mapper.setNodePart(bundleId, id, {
      renderedLength,
      gzipLength,
      brotliLength,
    });

    const trimmedModuleId = mapper.trimProjectRootId(id);

    const pathParts = trimmedModuleId.split(/\\|\//).filter((p) => p !== "");
    addToPath(trimmedModuleId, tree, pathParts, {
      cid: count++,
      gzipSize: gzipLength,
      parsedSize: brotliLength,
      statSize: renderedLength,
      weight: renderedLength,
    });
  }

  tree.groups = tree.groups.map((node: any) => {
    tree.cid = count++;
    if (isModuleTree(node)) {
      return mergeSingleChildTrees(node);
    } else {
      return node;
    }
  });

  return tree;
};

export const mergeTrees = (trees: Array<ModuleTree | ModuleTreeLeaf>): ModuleTree => {
  const newTree = {
    name: "root",
    children: trees,
    isRoot: true,
  };

  return newTree;
};

export const addLinks = (
  startModuleId: string,
  getModuleInfo: GetModuleInfo,
  mapper: ModuleMapper
): void => {
  const processedNodes: Record<string, boolean> = {};

  const moduleIds = [startModuleId];

  while (moduleIds.length > 0) {
    const moduleId = moduleIds.shift() as string;

    if (processedNodes[moduleId]) {
      continue;
    } else {
      processedNodes[moduleId] = true;
    }

    const moduleInfo = getModuleInfo(moduleId);

    if (!moduleInfo) {
      return;
    }

    if (moduleInfo.isEntry) {
      mapper.setNodeMeta(moduleId, { isEntry: true });
    }
    if (moduleInfo.isExternal) {
      mapper.setNodeMeta(moduleId, { isExternal: true });
    }

    for (const importedId of moduleInfo.importedIds) {
      mapper.addImportedByLink(importedId, moduleId);
      mapper.addImportedLink(moduleId, importedId);

      moduleIds.push(importedId);
    }
    for (const importedId of moduleInfo.dynamicallyImportedIds || []) {
      mapper.addImportedByLink(importedId, moduleId);
      mapper.addImportedLink(moduleId, importedId, true);

      moduleIds.push(importedId);
    }
  }
};
