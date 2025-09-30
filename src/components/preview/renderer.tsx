/** biome-ignore-all lint/suspicious/noArrayIndexKey: pls */

import type { MarkdownNode } from "@/utils/types";

export function MarkdownRenderer({ nodes }: { nodes: MarkdownNode[] }) {
    return nodes.map((node, i) => {
        switch (node.type) {
            case "linebreak":
                return <br key={i} />;

            case "heading": {
                if (node.level === 1) {
                    return (
                        <h1 className="md-h1" key={i}>
                            {node.content}
                        </h1>
                    );
                } else if (node.level === 2) {
                    return (
                        <h2 className="md-h2" key={i}>
                            {node.content}
                        </h2>
                    );
                } else {
                    return (
                        <h3 className="md-h3" key={i}>
                            {node.content}
                        </h3>
                    );
                }
            }

            case "paragraph":
                return (
                    <p key={i} className="md-paragraph">
                        {node.content}
                    </p>
                );

            case "small":
                return (
                    <small className="md-small" key={i}>
                        {node.content}
                    </small>
                );

            case "list":
                return node.ordered ? (
                    <ol key={i} className="ml-4 list-decimal flex flex-col gap-2">
                        {node.items.map((it, i) => (
                            <li key={i}>{it}</li>
                        ))}
                    </ol>
                ) : (
                    <ul key={i} className="ml-4 list-disc flex flex-col gap-2">
                        {node.items.map((it, i) => (
                            <li key={i}>{it}</li>
                        ))}
                    </ul>
                );

            default:
                return null;
        }
    });
}
