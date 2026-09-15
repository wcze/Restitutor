import { clamp, formatNumber, type Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { autonomyAdjustmentConditions, getSettledTileAutonomy, setTileAutonomy } from "../logic/AutonomyLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function AdjustAutonomyAction(tile: Tile, value: number, province: Province, save: SaveGame): IGameAction {
   const oldValue = save.state.tiles.get(tile)?.autonomy;
   return {
      condition: finalizeCondition([
         ...autonomyAdjustmentConditions(tile, province, save),
         {
            name: $t(L.AutonomyHasChanged),
            value: Number.isFinite(value) && oldValue !== clamp(value, 0, 100),
            desc: $t(L.From$1To$2, formatNumber(oldValue), formatNumber(clamp(value, 0, 100))),
         },
      ]),
      execute: () => {
         setTileAutonomy(tile, value, province, save);
      },
   };
}

export function SettleUnrestAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   return AdjustAutonomyAction(tile, getSettledTileAutonomy(tile, save), province, save);
}
