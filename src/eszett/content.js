const queryline = "input, textarea, [contenteditable=''], [contenteditable='true']";

// Replace ẞ -> SS and ß -> ss
function replaceEszett(str) {
    if (typeof str !== "string" || !str) return str;
    return str.replaceAll("ẞ", "SS").replaceAll("ß", "ss");
}

// ---- Text nodes (normal page text) ----
function processTextNode(node) {
    const oldText = node.nodeValue;
    const newText = replaceEszett(oldText);
    if (newText !== oldText) { 
        node.nodeValue = newText; 
    }
}

function acceptTextNode(node) {
    // Skip script/style/noscript and a few common non-visible areas
    const p = node.parentElement;
    if (!p) { return NodeFilter.FILTER_REJECT; }
    const tag = p.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
        return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
}

function walkAndProcess(root) {
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        { acceptNode: acceptTextNode }
    );

    let n;
    while ((n = walker.nextNode())) {
        processTextNode(n);
    }
}

// ---- Inputs / textareas / contenteditable ----
function processEditable(el) {
    // input/textarea value
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const oldVal = el.value;
        const newVal = replaceEszett(oldVal);
        if (newVal !== oldVal) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            el.value = newVal;
            // Try to preserve cursor/selection
            if (typeof start === "number" && typeof end === "number") {
                const delta = newVal.length - oldVal.length;
                el.setSelectionRange(start + delta, end + delta);
            }
        }
        return;
    }

    // contenteditable (innerText / text nodes)
    if (el.isContentEditable) {
        // Safer to process text nodes inside it
        walkAndProcess(el);
    }
}

function processNodeIfRelevant(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
        return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = /** @type {Element} */ (node);

    // Process element itself if editable
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        processEditable(el);
    } else if (/** @type {HTMLElement} */ (el).isContentEditable) {
        processEditable(/** @type {HTMLElement} */ (el));
    }

    // Process any text nodes within the subtree
    walkAndProcess(el);

    // Process any editable descendants
    if (el.querySelectorAll) {
        el.querySelectorAll(queryline).forEach(processEditable);
    }
}

function eventListener(e) {
    const t = e.target;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
        processEditable(t);
    } else if (t instanceof HTMLElement && t.isContentEditable) {
        processEditable(t);
    }
}

function mutationObserver(mutations) {
    for (const m of mutations) {
        if (m.type === "characterData") {
            processTextNode(m.target);
        } else if (m.type === "childList") {
            m.addedNodes.forEach(processNodeIfRelevant);
        } else if (m.type === "attributes") {
            // If something becomes contenteditable, process it
            if (m.attributeName === "contenteditable") {
                processNodeIfRelevant(m.target);
            }
        }
    }
}

function processDocumentTitle() {
    const oldTitle = document.title;
    const newTitle = replaceEszett(oldTitle);
    if (newTitle !== oldTitle) {
        document.title = newTitle;
    }
}

function main() {
    // Process tab title + everything visible
    if (document.head) { 
        walkAndProcess(document.head); // includes <title>
    }
    if (document.body) {
        walkAndProcess(document.body);
    }
    processDocumentTitle();
    document.querySelectorAll(queryline).forEach(processEditable);

    // Keep up with changes
    const observer = new MutationObserver(mutationObserver);

    observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["contenteditable"]
    });

    // Also catch user typing in form fields
    document.addEventListener("input", eventListener, true);
}

// Initial pass
main();