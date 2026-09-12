import type { Tile } from "@project/shared/src/utils/Helper";
import { finalizeCondition, type IConditionBreakdown } from "../game/actions/GameAction";
import { Goods } from "../game/definitions/Goods";
import { GameStateUpdated, RefreshTiles } from "../game/Events";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ActionButton } from "./ActionButton";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { ResourceCostComp } from "./ResourceCostComp";

export const TileGoodsChangeCost = { gold: 50 } as const;

export function getTileGoodsChangeCondition(tile: Tile): IConditionBreakdown {
   const data = G.save.state.tiles.get(tile);
   const available = data?.goodsChangedAt === undefined || G.save.state.month - data.goodsChangedAt >= 6;
   return finalizeCondition([
      { name: $t(L.TileIsOurs), value: data?.province === G.save.state.playerProvince },
      { name: $t(L.TCChangeTileOutputCooldown), value: available },
   ]);
}

export function TileGoodsModal({ tile }: { tile: Tile }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   const options = tileData.goodsOptions ?? [tileData.goods];
   return (
      <ModalComp size="xs" title={<ModalTitleBar title={$t(L.TCChangeTileOutput)} dismiss />}>
         <div className="m10">
            <ConditionBreakdownComp condition={getTileGoodsChangeCondition(tile)} />
            <ResourceCostComp cost={TileGoodsChangeCost} />
         </div>
         <div className="m10">
            {options.map((goods) => (
               <ActionButton
                  key={goods}
                  className="w100 row my5"
                  action={() => ({
                     cost: TileGoodsChangeCost,
                     condition: finalizeCondition([
                        ...getTileGoodsChangeCondition(tile).breakdown,
                        { name: $t(L.TCChangeTileOutput), value: goods !== tileData.goods },
                     ]),
                     execute: () => {
                        tileData.goods = goods;
                        tileData.goodsChangedAt = G.save.state.month;
                        RefreshTiles.emit({ tiles: [tile], options: { visual: true } });
                        hideModal();
                     },
                  })}
               >
                  <img src={Goods[goods].icon} width={32} height={32} className="mr10" />
                  <span>{Goods[goods].name()}</span>
               </ActionButton>
            ))}
         </div>
      </ModalComp>
   );
}
