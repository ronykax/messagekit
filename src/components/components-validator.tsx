import {
    type APIComponentInContainer,
    type APIMessageComponent,
    ButtonStyle,
    ComponentType,
} from "discord-api-types/v10";
import { TriangleAlertIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import { useOutputStore } from "@/lib/stores/output";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

function getComponentName(type: ComponentType) {
    switch (type) {
        case ComponentType.TextDisplay:
            return "Text";
        case ComponentType.Section:
            return "Text";
        case ComponentType.Container:
            return "Container";
        case ComponentType.MediaGallery:
            return "Media";
        case ComponentType.ActionRow:
            return "Buttons";
        default:
            return "Component";
    }
}

// Helper function to convert numbers to ordinal strings (1st, 2nd, 3rd, etc.)
const toOrdinal = (num: number): string => {
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
};

// Helper function to create user-friendly path descriptions
const getPathDescription = (path: number[]): string => {
    if (path.length === 1) {
        return `${toOrdinal(path[0])} component`;
    }

    // For nested components, describe the hierarchy more clearly
    const parentPath = path.slice(0, -1);
    const currentIndex = path[path.length - 1];

    if (parentPath.length === 1) {
        return `${toOrdinal(currentIndex)} item in ${toOrdinal(parentPath[0])} component`;
    }

    // For deeper nesting, keep it simple but clear
    return `${toOrdinal(currentIndex)} item in nested component`;
};

const validateComponents = (
    components: APIMessageComponent[] | APIComponentInContainer[],
    path: number[] = [],
): string[] => {
    const errors: string[] = [];

    components.forEach((component, index) => {
        const currentPath = [...path, index + 1];
        const pathDescription = getPathDescription(currentPath);
        const componentName = getComponentName(component.type);

        if (component.type === ComponentType.TextDisplay && component.content.trim() === "") {
            errors.push(`${pathDescription} (${componentName}) needs some text content.`);
        } else if (
            component.type === ComponentType.Section &&
            component.components[0].content.trim() === ""
        ) {
            errors.push(`${pathDescription} (${componentName}) needs some content.`);
        } else if (component.type === ComponentType.MediaGallery && component.items.length <= 0) {
            errors.push(`${pathDescription} (${componentName}) needs at least one image.`);
        } else if (component.type === ComponentType.ActionRow && component.components.length <= 0) {
            errors.push(`${pathDescription} (${componentName}) needs at least one button.`);
        }

        // Check for duplicate custom IDs with clearer messaging
        if (component.type === ComponentType.ActionRow && component.components.length > 0) {
            const customIds = new Set<string>();

            component.components.forEach((childComponent, childIndex) => {
                if (childComponent.type === ComponentType.Button) {
                    // Only buttons with certain styles have custom_id
                    if (
                        childComponent.style !== ButtonStyle.Premium &&
                        childComponent.style !== ButtonStyle.Link
                    ) {
                        const customId = childComponent.custom_id;

                        if (customId) {
                            if (customIds.has(customId)) {
                                const buttonDescription =
                                    currentPath.length === 1
                                        ? `${toOrdinal(childIndex + 1)} button in ${toOrdinal(currentPath[0])} component`
                                        : `${toOrdinal(childIndex + 1)} button in button group`;

                                errors.push(
                                    `${buttonDescription} has the same action as another button. Each button needs a unique action.`,
                                );
                            } else {
                                customIds.add(customId);
                            }
                        }
                    }
                }
            });
        }

        if (component.type === ComponentType.Container) {
            if (component.components.length <= 0) {
                errors.push(
                    `${pathDescription} (${componentName}) needs at least one component inside it.`,
                );
            } else {
                errors.push(...validateComponents(component.components, currentPath));
            }
        }
    });

    return errors;
};

export default function ComponentsValidator() {
    const { output } = useOutputStore();

    const errors = useMemo(() => validateComponents(output), [output]);

    if (errors.length === 0) {
        return null;
    }

    return (
        <Alert variant="destructive" className="rounded-xl">
            <TriangleAlertIcon />
            <AlertTitle>Fix errors before sending</AlertTitle>
            <AlertDescription>
                <ul className="list-disc list-inside">
                    {errors.map((error, _index) => {
                        const parts = error.split(/(\[.*?\])/g);

                        return (
                            <li key={nanoid(10)}>
                                {parts.map((part) => {
                                    if (part.startsWith("[") && part.endsWith("]")) {
                                        return (
                                            <span key={nanoid(10)} className="font-mono">
                                                {part}
                                            </span>
                                        );
                                    }
                                    return <span key={nanoid(10)}>{part}</span>;
                                })}
                            </li>
                        );
                    })}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
