import { Slider } from "@mantine/core";
import type { Tile } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { AdjustAutonomyAction, SettleUnrestAction } from "../game/actions/AdjustAutonomyAction";
import { finalizeCondition } from "../game/actions/GameAction";
import { autonomyAdjustmentConditions } from "../game/logic/AutonomyLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { FloatingTip } from "./components/FloatingTip";

export function TileAutonomyComp({ tile }: { tile: Tile }): React.ReactNode {
   const [draft, setDraft] = useState<number>();
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   const isMyProvince = tileData.province === G.save.state.playerProvince;
   const editing = isMyProvince && draft !== undefined;
   return (
      <>
         <div className="h1 my10 row g5">
            <div className="f1">{$t(L.Autonomy)}</div>
            {isMyProvince &&
               (editing ? (
                  <>
                     <ActionButton
                        className="text-sm"
                        action={() => {
                           const action = AdjustAutonomyAction(tile, draft, G.save.state.playerProvince, G.save);
                           return {
                              ...action,
                              execute: (options) => {
                                 action.execute(options);
                                 setDraft(undefined);
                              },
                           };
                        }}
                        tooltip={autonomyActionTooltip}
                     >
                        {$t(L.Apply)}
                     </ActionButton>
                     <button className="btn text-sm" onClick={() => setDraft(undefined)}>
                        {$t(L.Cancel)}
                     </button>
                  </>
               ) : (
                  <ActionButton
                     className="text-sm"
                     action={() => ({
                        condition: finalizeCondition(
                           autonomyAdjustmentConditions(tile, G.save.state.playerProvince, G.save),
                        ),
                        execute: () => setDraft(G.save.state.tiles.get(tile)?.autonomy),
                     })}
                     tooltip={autonomyActionTooltip}
                  >
                     <div className="row g5">
                        <div className="mi xs">tune</div>
                        <div>{$t(L.Adjust)}</div>
                     </div>
                  </ActionButton>
               ))}
         </div>
         {isMyProvince && (
            <>
               <Slider
                  className="mx10"
                  min={0}
                  max={100}
                  step={1}
                  value={draft ?? tileData.autonomy}
                  disabled={!editing}
                  onChange={setDraft}
               />
               <div className="h5" />
            </>
         )}
         <div className="row mx10 g5">
            <FloatingTip fixedWidth className="p0" label={() => <TimedActionDescComp action="AdjustAutonomy" />}>
               <div>{$t(L.Autonomy)}</div>
            </FloatingTip>
            <div className="f1" />
            {isMyProvince && (
               <ActionButton
                  className="text-sm"
                  action={() => {
                     const action = SettleUnrestAction(tile, G.save.state.playerProvince, G.save);
                     return {
                        ...action,
                        execute: (options) => {
                           action.execute(options);
                           setDraft(undefined);
                        },
                     };
                  }}
                  tooltip={(element) => (
                     <>
                        <div className="m10">{$t(L.SettlingUnrestAdjustsAutonomySoThatTileUnrestIsAtMost$1, "0")}</div>
                        {autonomyActionTooltip(element)}
                     </>
                  )}
               >
                  {$t(L.SettleUnrest)}
               </ActionButton>
            )}
            <div>{editing ? draft : tileData.autonomy}</div>
         </div>
      </>
   );
}

function autonomyActionTooltip(element: React.ReactNode): React.ReactNode {
   return (
      <>
         <TimedActionDescComp action="AdjustAutonomy" />
         {element}
      </>
   );
}
