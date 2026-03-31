import { Injectable } from "@angular/core";
import { FuseNavigationItem } from "@fuse/components/navigation";
import { ScreenNavigation } from "./screenNavigation";

@Injectable({
    providedIn: 'root'
})

export class AppNavigationMapper {
    toFuseNavigation(screens: ScreenNavigation[]): FuseNavigationItem[] {
        const itemMap = new Map<string, FuseNavigationItem>();
        const roots: FuseNavigationItem[] = [];

        // First pass: create all items
        for (const screen of screens) {
            itemMap.set(screen.id, {
                id: screen.id,
                title: screen.title,
                type: 'collapsable',
                icon: screen.icon,
                link: screen.link,
                children: []
            });
        }

        // Second pass: build hierarchy
        for (const screen of screens) {
            const current = itemMap.get(screen.id)!;
            const parentCode = screen.parentCode?.trim();

            if (parentCode) {
                const parent = itemMap.get(parentCode);

                if (parent) {
                    parent.children ??= [];
                    parent.children.push(current);

                    // A parent with children should not navigate
                    delete parent.link;
                }
                else {
                    roots.push(current);
                }
            }
            else {
                roots.push(current);
            }
        }

        return this._normalizeItems(roots);
    }

    private _normalizeItems(items: FuseNavigationItem[]): FuseNavigationItem[] {
        return items.map((item) => {
            const children = item.children?.length
                ? this._normalizeItems(item.children)
                : undefined;

            const normalized: FuseNavigationItem = {
                ...item,
                type: children?.length ? 'collapsable' : 'basic',
                children
            };

            if (children?.length) {
                delete normalized.link;
            }

            if (!children?.length) {
                delete normalized.children;
            }

            return normalized;
            
        }).filter(Boolean)
    }

}