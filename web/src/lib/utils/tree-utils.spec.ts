import { getParentPath, getPathParts, joinPaths, normalizeTreePath, TreeNode } from '$lib/utils/tree-utils';

describe('normalizeTreePath', () => {
  it('should drop a trailing slash', () => {
    expect(normalizeTreePath('/a/b/')).toBe('/a/b');
  });

  it('should keep a path that has no trailing slash', () => {
    expect(normalizeTreePath('/a/b')).toBe('/a/b');
  });

  it('should keep the root path intact', () => {
    expect(normalizeTreePath('/')).toBe('/');
  });
});

describe('getPathParts', () => {
  it('should keep the leading slash as its own part', () => {
    expect(getPathParts('/a/b')).toEqual(['/', 'a', 'b']);
  });

  it('should ignore a trailing slash', () => {
    expect(getPathParts('/a/b/')).toEqual(['/', 'a', 'b']);
  });

  it('should split a relative path', () => {
    expect(getPathParts('a/b')).toEqual(['a', 'b']);
  });
});

describe('joinPaths', () => {
  it('should join two segments with a separator', () => {
    expect(joinPaths('a', 'b')).toBe('a/b');
  });

  it('should not double up an existing separator', () => {
    expect(joinPaths('/', 'a')).toBe('/a');
    expect(joinPaths('a/', 'b')).toBe('a/b');
  });

  it('should return the other segment when one is empty', () => {
    expect(joinPaths('', 'a')).toBe('a');
    expect(joinPaths('a', '')).toBe('a');
  });
});

describe('getParentPath', () => {
  it('should return the containing directory', () => {
    expect(getParentPath('/a/b')).toBe('/a');
  });

  it('should normalize a trailing slash before walking up', () => {
    expect(getParentPath('/a/b/')).toBe('/a');
  });

  it('should return the root for a top level path', () => {
    expect(getParentPath('/a')).toBe('/');
  });

  it('should return a relative path with no parent unchanged', () => {
    expect(getParentPath('a')).toBe('a');
  });
});

describe('TreeNode', () => {
  it('should build a tree from paths', () => {
    const root = TreeNode.fromPaths(['/a/b', '/a/c']);

    expect([...root.keys()]).toEqual(['/']);
    expect([...root.get('/')!.keys()]).toEqual(['a']);
    expect([...root.get('/')!.get('a')!.keys()]).toEqual(['b', 'c']);
  });

  it('should mark only the leaves as having assets', () => {
    const root = TreeNode.fromPaths(['/a/b']);

    expect(root.traverse('/a').hasAssets).toBe(false);
    expect(root.traverse('/a/b').hasAssets).toBe(true);
  });

  it('should traverse to a node by path', () => {
    const root = TreeNode.fromPaths(['/a/b', '/a/c']);
    const node = root.traverse('/a');

    expect(node.value).toBe('a');
    expect(node.path).toBe('/a');
    expect(node.children.map((child) => child.value)).toEqual(['b', 'c']);
  });

  it('should expose the ancestors of a node, outermost first', () => {
    const root = TreeNode.fromPaths(['/a/b']);

    expect(root.traverse('/a/b').parents.map((parent) => parent.value)).toEqual(['/', 'a']);
  });

  it('should collapse chains of single children that hold no assets', () => {
    const root = TreeNode.fromPaths(['/a/b', '/a/c']);
    root.collapse();

    // "/" and "a" both had a single child and no assets of their own, so they
    // are folded into one "/a" node holding the two leaves.
    expect([...root.keys()]).toEqual(['/a']);
    expect([...root.get('/a')!.keys()]).toEqual(['b', 'c']);
  });
});
