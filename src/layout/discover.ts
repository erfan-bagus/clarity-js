import { Priority } from "@clarity-types/core";
import { Event, Metric } from "@clarity-types/data";
import { Source } from "@clarity-types/layout";
import measure from "@src/core/measure";
import * as task from "@src/core/task";
import * as boxmodel from "@src/layout/boxmodel";
import * as doc from "@src/layout/document";
import * as dom from "@src/layout/dom";
import encode from "@src/layout/encode";

import processNode from "./node";

export function start(): void {
    task.schedule(discover, Priority.High).then(() => {
        measure(doc.compute)();
        measure(boxmodel.compute)();
    });
}

async function discover(): Promise<void> {
    let timer = Metric.DiscoverDuration;
    task.start(timer);
    dom.extractRegions(document);
    let walker = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false);
    let node = walker.nextNode();
    while (node) {
        if (task.shouldYield(timer)) { await task.suspend(timer); }
        processNode(node, Source.Discover);
        node = walker.nextNode();
    }
    await encode(Event.Discover);
    task.stop(timer);
}