const fs = require('fs');
const path = require('path');

function patchFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) {
    console.log(`[patch-expo-router] File not found, skipping: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { search, replace } of transforms) {
    if (content.includes(search)) {
      content = content.replace(search, replace);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch-expo-router] Successfully patched: ${filePath}`);
  } else {
    console.log(`[patch-expo-router] Already patched or pattern not found: ${filePath}`);
  }
}

// 1. Patch expo-router/build/fork/useLinking.native.js
const forkUseLinking = path.join(__dirname, '..', 'node_modules', 'expo-router', 'build', 'fork', 'useLinking.native.js');
patchFile(forkUseLinking, [
  {
    search: `                        if (typeof url === 'string') {
                            // If the link were handled, it gets cleared in NavigationContainer
                            onUnhandledLinking((0, extractPathFromURL_1.extractExpoPathFromURL)(prefixes, url));
                        }`,
    replace: `                        if (typeof url === 'string') {
                            // If the link were handled, it gets cleared in NavigationContainer
                            setTimeout(() => {
                                onUnhandledLinking((0, extractPathFromURL_1.extractExpoPathFromURL)(prefixes, url));
                            }, 0);
                        }`
  },
  {
    search: `                else {
                    onUnhandledLinking((0, extractPathFromURL_1.extractExpoPathFromURL)(prefixes, url));
                }`,
    replace: `                else {
                    setTimeout(() => {
                        onUnhandledLinking((0, extractPathFromURL_1.extractExpoPathFromURL)(prefixes, url));
                    }, 0);
                }`
  }
]);

// 2. Patch expo-router/build/fork/NavigationContainer.js
const forkNavContainer = path.join(__dirname, '..', 'node_modules', 'expo-router', 'build', 'fork', 'NavigationContainer.js');
patchFile(forkNavContainer, [
  {
    search: `    const [lastUnhandledLink, setLastUnhandledLink] = react_1.default.useState();
    const { getInitialState } = (0, useLinking_1.useLinking)(refContainer, {
        enabled: isLinkingEnabled,
        prefixes: [],
        ...linking,
    }, setLastUnhandledLink);`,
    replace: `    const [lastUnhandledLink, setLastUnhandledLink] = react_1.default.useState();
    const isMountedRef = react_1.default.useRef(false);
    react_1.default.useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    const safeSetLastUnhandledLink = react_1.default.useCallback((value) => {
        if (!isMountedRef.current) {
            setTimeout(() => {
                setLastUnhandledLink(value);
            }, 0);
        } else {
            setLastUnhandledLink(value);
        }
    }, [setLastUnhandledLink]);
    const { getInitialState } = (0, useLinking_1.useLinking)(refContainer, {
        enabled: isLinkingEnabled,
        prefixes: [],
        ...linking,
    }, safeSetLastUnhandledLink);`
  }
]);

// 3. Patch expo-router/build/react-navigation/native/useLinking.native.js (if present)
const reactNavUseLinking = path.join(__dirname, '..', 'node_modules', 'expo-router', 'build', 'react-navigation', 'native', 'useLinking.native.js');
patchFile(reactNavUseLinking, [
  {
    search: `                        if (typeof url === 'string') {
                            // If the link were handled, it gets cleared in NavigationContainer
                            onUnhandledLinking((0, extractPathFromURL_1.extractPathFromURL)(prefixes, url));
                        }`,
    replace: `                        if (typeof url === 'string') {
                            // If the link were handled, it gets cleared in NavigationContainer
                            setTimeout(() => {
                                onUnhandledLinking((0, extractPathFromURL_1.extractPathFromURL)(prefixes, url));
                            }, 0);
                        }`
  },
  {
    search: `                else {
                    onUnhandledLinking((0, extractPathFromURL_1.extractPathFromURL)(prefixes, url));
                }`,
    replace: `                else {
                    setTimeout(() => {
                        onUnhandledLinking((0, extractPathFromURL_1.extractPathFromURL)(prefixes, url));
                    }, 0);
                }`
  }
]);
