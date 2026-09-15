import type { ComponentProps, ElementType } from "react";
import { ShowModal, UpdateSidebar } from "../../game/Events";
import type { PanelIdentity } from "./PanelTypes";

let nextModalId = 0;

export function showModalImmediately<Component extends ElementType & PanelIdentity>(
   Component: Component,
   props: NoInfer<ComponentProps<Component>>,
): void {
   const Panel = Component as ElementType;
   ShowModal.emit({ Component, content: <Panel {...props} />, id: ++nextModalId, immediate: true });
}

export function showPanel<Component extends ElementType & PanelIdentity>(
   Component: Component,
   props: NoInfer<ComponentProps<Component>>,
): void {
   const Panel = Component as ElementType;
   const content = <Panel {...props} />;
   const name = Component.name;
   if (name.endsWith("SingletonModal")) {
      ShowModal.emit({ Component, id: ++nextModalId, content });
      return;
   }
   if (name.endsWith("Modal")) {
      ShowModal.emit({ Component, id: ++nextModalId, content });
      return;
   }
   if (name.endsWith("Page")) {
      UpdateSidebar.emit(content);
      return;
   }
   throw new Error(`showPanel: unknown panel type: ${name}`);
}
